import SwiftUI
import WebKit

#if os(iOS)
typealias PlatformViewRepresentable = UIViewRepresentable
#else
typealias PlatformViewRepresentable = NSViewRepresentable
#endif

struct ArcanaWebView: PlatformViewRepresentable {
    func makeCoordinator() -> WebCoordinator { WebCoordinator() }

    #if os(iOS)
    func makeUIView(context: Context) -> WKWebView { context.coordinator.makeWebView() }
    func updateUIView(_ view: WKWebView, context: Context) {}
    #else
    func makeNSView(context: Context) -> WKWebView { context.coordinator.makeWebView() }
    func updateNSView(_ view: WKWebView, context: Context) {}
    #endif
}

final class WebCoordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler, WKDownloadDelegate {
    private var downloadDestination: URL?

    func makeWebView() -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.userContentController.add(self, name: "arcana")
        let restore = Persistence.restoreScript()
        if !restore.isEmpty {
            config.userContentController.addUserScript(WKUserScript(source: restore, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }
        #if os(iOS)
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        #endif

        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self
        web.uiDelegate = self
        web.allowsBackForwardNavigationGestures = false
        #if DEBUG
        if #available(iOS 16.4, macOS 13.3, *) { web.isInspectable = true }
        #endif

        #if os(iOS)
        web.isOpaque = false
        web.backgroundColor = Theme.uiBackground
        web.scrollView.backgroundColor = Theme.uiBackground
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.scrollView.bounces = false
        web.scrollView.showsVerticalScrollIndicator = false
        #else
        // WKWebView no expone una API pública para el fondo transparente en macOS: solo se usa si existe.
        if web.responds(to: NSSelectorFromString("setDrawsBackground:")) { web.setValue(false, forKey: "drawsBackground") }
        #endif

        if let dir = Bundle.main.resourceURL?.appendingPathComponent("Web", isDirectory: true) {
            let index = dir.appendingPathComponent("index.html")
            web.loadFileURL(index, allowingReadAccessTo: dir)
        }
        return web
    }

    // MARK: Mensajes desde la web (copia de seguridad y vibración)
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any], let type = body["t"] as? String else { return }
        switch type {
        case "backup":
            if let json = body["data"] as? String { DispatchQueue.global(qos: .utility).async { Persistence.save(json) } }
        case "haptic":
            #if os(iOS)
            let style = body["s"] as? String ?? "light"
            let kind: UIImpactFeedbackGenerator.FeedbackStyle = style == "soft" ? .soft : style == "medium" ? .medium : .light
            UIImpactFeedbackGenerator(style: kind).impactOccurred()
            #endif
        case "drag":
            #if os(macOS)
            // Ventana sin barra de título: la web pide arrastrar desde su franja superior.
            if let w = NSApp.keyWindow, let e = NSApp.currentEvent { w.performDrag(with: e) }
            #endif
        default: break
        }
    }

    // MARK: Navegación: lo externo se abre en el navegador; las descargas se gestionan
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if navigationAction.shouldPerformDownload { decisionHandler(.download); return }
        if let url = navigationAction.request.url, url.scheme == "http" || url.scheme == "https" || url.scheme == "mailto", navigationAction.navigationType == .linkActivated {
            open(url); decisionHandler(.cancel); return
        }
        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        decisionHandler(navigationResponse.canShowMIMEType ? .allow : .download)
    }

    func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) { download.delegate = self }
    func webView(_ webView: WKWebView, navigationResponse: WKNavigationResponse, didBecome download: WKDownload) { download.delegate = self }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url { open(url) }
        return nil
    }

    private func open(_ url: URL) {
        #if os(iOS)
        UIApplication.shared.open(url)
        #else
        NSWorkspace.shared.open(url)
        #endif
    }

    // MARK: Descargas (CSV, certificado…)
    func download(_ download: WKDownload, decideDestinationUsing response: URLResponse, suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
        #if os(iOS)
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(suggestedFilename)
        try? FileManager.default.removeItem(at: url)
        downloadDestination = url
        completionHandler(url)
        #else
        DispatchQueue.main.async {
            let panel = NSSavePanel()
            panel.nameFieldStringValue = suggestedFilename
            panel.begin { result in
                if result == .OK, let url = panel.url {
                    try? FileManager.default.removeItem(at: url)
                    self.downloadDestination = url
                    completionHandler(url)
                } else { completionHandler(nil) }
            }
        }
        #endif
    }

    func downloadDidFinish(_ download: WKDownload) {
        #if os(iOS)
        guard let url = downloadDestination else { return }
        DispatchQueue.main.async {
            let vc = UIActivityViewController(activityItems: [url], applicationActivities: nil)
            Self.topController()?.present(vc, animated: true)
        }
        #endif
    }

    #if os(iOS)
    private static func topController() -> UIViewController? {
        let scene = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
        var top = scene?.windows.first(where: { $0.isKeyWindow })?.rootViewController
        while let next = top?.presentedViewController { top = next }
        return top
    }
    #endif

    // MARK: Diálogos de JavaScript y selector de archivos
    #if os(iOS)
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let a = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        Self.topController()?.present(a, animated: true)
    }
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let a = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "Cancelar", style: .cancel) { _ in completionHandler(false) })
        a.addAction(UIAlertAction(title: "Aceptar", style: .default) { _ in completionHandler(true) })
        Self.topController()?.present(a, animated: true)
    }
    #else
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let a = NSAlert(); a.messageText = message; a.addButton(withTitle: "OK"); a.runModal(); completionHandler()
    }
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let a = NSAlert(); a.messageText = message; a.addButton(withTitle: "Aceptar"); a.addButton(withTitle: "Cancelar")
        completionHandler(a.runModal() == .alertFirstButtonReturn)
    }
    func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
        let panel = NSOpenPanel()
        panel.allowsMultipleSelection = parameters.allowsMultipleSelection
        panel.canChooseFiles = true; panel.canChooseDirectories = false
        panel.begin { result in completionHandler(result == .OK ? panel.urls : nil) }
    }
    #endif
}
