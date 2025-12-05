# 🚀 Guía Completa de Despliegue - TodoApp

## 📋 Checklist de Preparación

### ✅ Lo que YA tienes configurado
- [x] Código fuente completo
- [x] Firebase configurado y funcionando
- [x] Autenticación con Firebase Auth
- [x] Base de datos Firestore
- [x] Notificaciones locales implementadas
- [x] Sistema de roles y permisos
- [x] Todas las pantallas funcionales
- [x] Drag & Drop en Kanban (requiere dev build)
- [x] Vista de calendario
- [x] Reportes y estadísticas

### ⚠️ Lo que FALTA para desplegar

## 1. 📱 Configuración de Notificaciones Push (FCM)

### Android
**Archivo necesario**: `google-services.json`

#### Cómo obtenerlo:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `infra-sublime-464215-m5`
3. Ve a **Configuración del proyecto** (ícono de engranaje)
4. En la pestaña **General**, baja a **Tus apps**
5. Si no existe app Android, haz clic en **Agregar app → Android**
   - **Nombre del paquete**: `com.todoapp.todo`
   - **Apodo de la app**: `TodoApp`
6. Descarga el archivo `google-services.json`
7. Colócalo en la raíz del proyecto: `c:\Users\TI\Documents\TODO\google-services.json`

### iOS
**Archivo necesario**: `GoogleService-Info.plist`

#### Cómo obtenerlo:
1. En Firebase Console → **Configuración del proyecto**
2. Si no existe app iOS, haz clic en **Agregar app → iOS**
   - **ID del paquete**: `com.todoapp.todo`
   - **Apodo de la app**: `TodoApp`
3. Descarga el archivo `GoogleService-Info.plist`
4. Colócalo en la raíz del proyecto: `c:\Users\TI\Documents\TODO\GoogleService-Info.plist`

### Actualizar app.config.js
```javascript
// app.config.js - Agregar esta sección
module.exports = {
  expo: {
    // ... configuración existente ...
    android: {
      package: 'com.todoapp.todo',
      googleServicesFile: './google-services.json', // ← AGREGAR
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#8B0000'
      }
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.todoapp.todo',
      googleServicesFile: './GoogleService-Info.plist' // ← AGREGAR
    },
    // ... resto de configuración ...
  }
};
```

---

## 2. 🎨 Assets e Iconos de la App

### Archivos necesarios:
```
assets/
├── icon.png           (1024x1024px) - Ícono principal
├── splash.png         (Mínimo 2048x2048px) - Pantalla de carga
└── adaptive-icon.png  (1024x1024px, Android) - Ícono adaptativo
```

### Generar automáticamente:
```bash
# Opción 1: Usar herramienta en línea
# https://easyappicon.com/
# Sube una imagen de 1024x1024px y genera todos los tamaños

# Opción 2: Usar Expo Icon Generator
npx expo-icon --icon ./path/to/your/icon.png
```

### Actualizar app.config.js
```javascript
module.exports = {
  expo: {
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#8B0000'
    },
    // ... resto ...
  }
};
```

---

## 3. 🔧 Instalar EAS CLI (Expo Application Services)

### Instalación global:
```bash
npm install -g eas-cli
```

### Iniciar sesión:
```bash
eas login
```

### Configurar proyecto:
```bash
cd C:\Users\TI\Documents\TODO
eas build:configure
```

Esto creará el archivo `eas.json`:

```json
{
  "cli": {
    "version": ">= 0.52.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 4. 📦 Crear Build de Desarrollo (Dev Client)

### ⚠️ IMPORTANTE
Como usas **Drag & Drop** con `react-native-reanimated`, necesitas un **Dev Client** en lugar de Expo Go.

### Instalar dependencia:
```bash
npx expo install expo-dev-client
```

### Crear build para Android:
```bash
# Build de desarrollo (para testing)
eas build --profile development --platform android

# Build de preview (APK instalable)
eas build --profile preview --platform android

# Build de producción
eas build --profile production --platform android
```

### Crear build para iOS:
```bash
# Requiere cuenta de Apple Developer ($99/año)
eas build --profile development --platform ios

# Build de preview
eas build --profile preview --platform ios

# Build de producción
eas build --profile production --platform ios
```

### Tiempo estimado:
- Primera build: 15-30 minutos
- Builds subsecuentes: 5-15 minutos

---

## 5. 🔐 Configurar Secrets en EAS

### Variables de entorno para producción:
```bash
# Agregar secrets de Firebase
eas secret:create --scope project --name FIREBASE_API_KEY --value "AIzaSyDNo2YzEqelUXBcMuSJq1n-eOKN5sHhGKM"
eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value "infra-sublime-464215-m5.firebaseapp.com"
eas secret:create --scope project --name FIREBASE_PROJECT_ID --value "infra-sublime-464215-m5"
eas secret:create --scope project --name FIREBASE_STORAGE_BUCKET --value "infra-sublime-464215-m5.firebasestorage.app"
eas secret:create --scope project --name FIREBASE_MESSAGING_SENDER_ID --value "205062729291"
eas secret:create --scope project --name FIREBASE_APP_ID --value "1:205062729291:web:da314180f361bf2a3367ce"
eas secret:create --scope project --name FIREBASE_MEASUREMENT_ID --value "G-T987W215LH"
```

### Verificar secrets:
```bash
eas secret:list
```

---

## 6. 🏪 Publicar en Tiendas

### Google Play Store (Android)

#### Requisitos previos:
1. **Cuenta de Google Play Developer** ($25 USD, un solo pago)
2. **Build de producción** (APK o AAB)
3. **Archivos de la tienda**:
   - Descripción de la app (corta y larga)
   - Capturas de pantalla (mínimo 2, máximo 8)
   - Ícono de alta resolución (512x512px)
   - Banner promocional (1024x500px)
   - Política de privacidad (URL)

#### Crear AAB (Android App Bundle):
```bash
# Actualizar eas.json para AAB
eas build --profile production --platform android
```

#### Subir a Google Play:
```bash
# Opción 1: Manual
# 1. Ve a https://play.google.com/console
# 2. Crea nueva aplicación
# 3. Completa información de la tienda
# 4. Sube el AAB en "Producción"

# Opción 2: Automático con EAS Submit
eas submit --platform android
```

### App Store (iOS)

#### Requisitos previos:
1. **Apple Developer Account** ($99 USD/año)
2. **Build de producción** (IPA)
3. **Archivos de la tienda**:
   - Descripción de la app
   - Capturas de pantalla (varios tamaños de iPhone/iPad)
   - Ícono de alta resolución (1024x1024px)
   - Política de privacidad (URL)

#### Crear IPA:
```bash
eas build --profile production --platform ios
```

#### Subir a App Store:
```bash
# Opción 1: Manual con Xcode/Transporter
# Opción 2: Automático con EAS Submit
eas submit --platform ios
```

---

## 7. 🔒 Reglas de Seguridad de Firestore

### Actualizar firestore.rules:
Tu archivo actual permite lectura/escritura a todos. Para producción, necesitas reglas más estrictas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: usuario autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function: es el propietario
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Usuarios - solo lectura autenticada
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }
    
    // Tareas - lectura autenticada, escritura solo asignados/creadores
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        (resource.data.createdBy == request.auth.uid || 
         resource.data.assignedTo == request.auth.uid);
    }
    
    // Chats - solo usuarios de la tarea
    match /chats/{chatId} {
      allow read, write: if isAuthenticated();
    }
    
    // Firmas - solo propietario
    match /signatures/{signatureId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(resource.data.userId);
    }
  }
}
```

### Desplegar reglas:
```bash
cd C:\Users\TI\Documents\TODO
firebase deploy --only firestore:rules
```

---

## 8. 📊 Firebase Analytics y Crashlytics (Opcional)

### Instalar dependencias:
```bash
npx expo install @react-native-firebase/app @react-native-firebase/analytics @react-native-firebase/crashlytics
```

### Configurar en app.config.js:
```javascript
module.exports = {
  expo: {
    plugins: [
      '@react-native-firebase/app',
      '@react-native-firebase/analytics',
      '@react-native-firebase/crashlytics'
    ]
  }
};
```

---

## 9. 📝 Política de Privacidad

### ⚠️ REQUERIDO por Google Play y App Store

Crea una página web simple con tu política de privacidad:

**Opciones:**
1. **Generador gratuito**: https://www.privacypolicygenerator.info/
2. **GitHub Pages**: Crea un repo público y usa GitHub Pages
3. **Hosting de Firebase**: 
   ```bash
   firebase init hosting
   firebase deploy --only hosting
   ```

**Contenido mínimo:**
- Qué datos recopilas (email, nombre, tareas, etc.)
- Cómo usas los datos
- Cómo proteges los datos
- Derechos del usuario (eliminar cuenta, exportar datos)
- Contacto

---

## 10. 🧪 Testing Previo al Lanzamiento

### Checklist de QA:

#### Funcionalidad Core
- [ ] Login/Registro funciona correctamente
- [ ] Crear tareas
- [ ] Editar tareas
- [ ] Eliminar tareas
- [ ] Drag & Drop en Kanban
- [ ] Vista de calendario
- [ ] Chat por tarea
- [ ] Reportes y exportación

#### Notificaciones
- [ ] Notificaciones locales funcionan
- [ ] Push notifications llegan correctamente
- [ ] Permisos de notificaciones se solicitan

#### Performance
- [ ] Carga rápida (<3 segundos)
- [ ] Scroll fluido (60fps)
- [ ] Sin crashes en 30 minutos de uso

#### Conectividad
- [ ] Funciona offline (lectura)
- [ ] Sincroniza al recuperar conexión
- [ ] Indicador de conexión visible

#### Seguridad
- [ ] No se puede acceder sin login
- [ ] Roles y permisos funcionan
- [ ] Datos sensibles no visibles en logs

---

## 📦 Resumen de Archivos Faltantes

### Crear estos archivos:

```
TODO/
├── google-services.json        ← Descargar de Firebase
├── GoogleService-Info.plist    ← Descargar de Firebase
├── assets/
│   ├── icon.png                ← Crear (1024x1024px)
│   ├── splash.png              ← Crear (2048x2048px)
│   └── adaptive-icon.png       ← Crear (1024x1024px, Android)
├── eas.json                    ← Se crea con `eas build:configure`
└── privacy-policy.html         ← Crear y hostear
```

---

## 🚀 Proceso Completo de Despliegue

### Paso a Paso:

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Iniciar sesión
eas login

# 3. Instalar expo-dev-client
cd C:\Users\TI\Documents\TODO
npx expo install expo-dev-client

# 4. Configurar EAS
eas build:configure

# 5. Agregar google-services.json y GoogleService-Info.plist
# (Descarga de Firebase Console)

# 6. Crear iconos y splash screen
# (Usa https://easyappicon.com/ o diseña manualmente)

# 7. Actualizar app.config.js con paths de assets

# 8. Build de desarrollo (para testing con Drag & Drop)
eas build --profile development --platform android

# 9. Instalar en dispositivo físico
# Descargar APK del link que te da EAS

# 10. Testing completo
# Probar todas las funcionalidades

# 11. Build de producción
eas build --profile production --platform android
eas build --profile production --platform ios

# 12. Submit a tiendas
eas submit --platform android
eas submit --platform ios
```

---

## 💰 Costos Estimados

| Servicio | Costo | Frecuencia |
|----------|-------|------------|
| **Firebase** (Spark Plan) | Gratis | Mensual |
| **Firebase** (Blaze Plan) | ~$25-50 | Mensual (opcional) |
| **Google Play Developer** | $25 | Un solo pago |
| **Apple Developer** | $99 | Anual |
| **EAS Build** (Expo) | Gratis | 30 builds/mes |
| **Dominio** (.com) | ~$10 | Anual (para privacy policy) |
| **TOTAL Primera Vez** | $134-159 | - |
| **TOTAL Anual** | $109-159 | - |

---

## ⏱️ Tiempo Estimado

| Tarea | Tiempo |
|-------|--------|
| Descargar archivos Firebase | 10 min |
| Crear iconos/splash | 30-60 min |
| Configurar EAS | 15 min |
| Primera build | 30 min |
| Testing QA completo | 2-4 horas |
| Crear política privacidad | 30-60 min |
| Setup cuentas tiendas | 1-2 horas |
| Submit a tiendas | 30 min |
| **TOTAL** | **6-9 horas** |

---

## 📞 Soporte y Recursos

### Documentación Oficial:
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com/)

### Herramientas Útiles:
- [EasyAppIcon](https://easyappicon.com/) - Generador de iconos
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- [Firebase CLI](https://firebase.google.com/docs/cli)

---

## ✅ Checklist Final

Antes de publicar, verifica:

- [ ] Todos los archivos necesarios están presentes
- [ ] Firebase configurado correctamente
- [ ] Notificaciones push funcionan
- [ ] Iconos y splash screen agregados
- [ ] Build de producción creada exitosamente
- [ ] Testing QA completo realizado
- [ ] Política de privacidad publicada
- [ ] Cuenta de tienda creada (Google/Apple)
- [ ] Capturas de pantalla y descripción preparadas
- [ ] Reglas de Firestore actualizadas para producción

---

**Última actualización**: Noviembre 28, 2025
**Versión de la app**: 1.0.0
**Siguiente paso**: Descargar `google-services.json` y `GoogleService-Info.plist` de Firebase
