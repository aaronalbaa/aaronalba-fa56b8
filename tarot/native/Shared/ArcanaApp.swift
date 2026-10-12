import SwiftUI

@main
struct ArcanaApp: App {
    var body: some Scene {
        #if os(macOS)
        WindowGroup {
            ArcanaWebView()
                .frame(minWidth: 860, minHeight: 620)
                .background(Theme.background)
                .ignoresSafeArea()
        }
        .windowStyle(.hiddenTitleBar)
        .defaultSize(width: 1220, height: 800)
        .commands { CommandGroup(replacing: .newItem) {} }
        #else
        WindowGroup {
            ArcanaWebView()
                .background(Theme.background)
                .ignoresSafeArea()
                .preferredColorScheme(.dark)
        }
        #endif
    }
}

enum Theme {
    static let background = Color(red: 13 / 255, green: 11 / 255, blue: 20 / 255)
    #if os(iOS)
    static let uiBackground = UIColor(red: 13 / 255, green: 11 / 255, blue: 20 / 255, alpha: 1)
    #endif
}
