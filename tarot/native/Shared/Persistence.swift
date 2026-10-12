import Foundation

/// Copia de seguridad de los datos de la app (localStorage) en un archivo del contenedor de la app.
/// Si el sistema borrara el almacenamiento web, al abrir se restaura desde aquí.
enum Persistence {
    private static var fileURL: URL {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("arcana-backup.json")
    }

    static func save(_ json: String) {
        guard let data = json.data(using: .utf8),
              (try? JSONSerialization.jsonObject(with: data)) is [String: Any] else { return }
        try? data.write(to: fileURL, options: .atomic)
    }

    /// Script que se inyecta antes de cargar la página: solo restaura al arrancar la app (no al recargar,
    /// para que «Borrar mis datos» no se deshaga) y solo si el perfil no existe.
    static func restoreScript() -> String {
        guard let data = try? Data(contentsOf: fileURL),
              (try? JSONSerialization.jsonObject(with: data)) is [String: Any],
              let json = String(data: data, encoding: .utf8) else { return "" }
        return """
        (function(){try{
          if(sessionStorage.getItem('arcana.restored'))return;
          sessionStorage.setItem('arcana.restored','1');
          if(localStorage.getItem('arcana.profile'))return;
          var o=\(json);
          for(var k in o){localStorage.setItem(k,o[k]);}
        }catch(e){}})();
        """
    }
}
