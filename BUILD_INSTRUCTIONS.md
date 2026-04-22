# PowerHaus - Gestor de Gimnasio

## Descripción
PowerHaus es una aplicación de escritorio multiplataforma para la gestión integral de gimnasios, desarrollada con Electron, Express y Firebase.

## Características
- 🏋️ Gestión de miembros y entrenadores
- 📅 Calendario y programación de clases
- 💳 Control de licencias con Firebase
- 🔐 Autenticación segura
- 💻 Multiplataforma (Windows, macOS, Linux)
- 📊 Reportes y análisis

## Descarga de Ejecutables

### Windows
- **Instalador**: `PowerHaus Setup X.X.X.exe`
- **Portable**: `PowerHaus X.X.X.exe`

### macOS
- **DMG**: `PowerHaus-X.X.X.dmg`
- **ZIP**: `PowerHaus-X.X.X.zip`

### Linux
- **AppImage**: `PowerHaus-X.X.X.AppImage`
- **DEB**: `PowerHaus-X.X.X.deb`

Los ejecutables están disponibles en [Releases](https://github.com/tu-usuario/gimnasio/releases).

## Instalación Local

```bash
git clone https://github.com/tu-usuario/gimnasio.git
cd gimnasio
npm install
npm start
```

## Compilación

```bash
npm run build
```

## Requisitos

- Node.js 18+
- npm o yarn
- Credenciales de Firebase (configurar en `firebase-config.js`)

## Configuración Firebase

Edita `firebase-config.js` con tus credenciales:

```javascript
window.__FIREBASE_CONFIG__ = {
  apiKey: "tu-api-key",
  authDomain: "tu-auth-domain",
  projectId: "tu-project-id",
  storageBucket: "tu-storage-bucket",
  messagingSenderId: "tu-messaging-id",
  appId: "tu-app-id"
};
```

## Estructura de Firestore

Crea una colección `licencias` con documentos que incluyan:
- `uid` (string): ID del usuario Firebase
- `email` (string): Email del usuario
- `activa` (boolean): Estado de la licencia

## Licencia

ISC

## Autor

PowerHaus Development

---

**Compilación automática**: Los ejecutables se generan automáticamente en GitHub Actions para todas las plataformas.
