# 🔥 CONFIGURACIÓN URGENTE DE FIREBASE

## ⚠️ IMPORTANTE: Debes hacer estos pasos AHORA para que la app funcione

### 1️⃣ APLICAR REGLAS DE FIRESTORE (MUY IMPORTANTE)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **infra-sublime-464215-m5**
3. En el menú lateral, ve a **Firestore Database**
4. Click en la pestaña **Reglas** (Rules)
5. **COPIA Y PEGA** todo el contenido del archivo `firestore.rules` que está en tu proyecto
6. Click en **Publicar** (Publish)

**⚠️ SIN ESTE PASO LA APP NO FUNCIONARÁ - Las reglas actuales probablemente bloquean todo**

---

### 2️⃣ HABILITAR AUTENTICACIÓN CON EMAIL/PASSWORD

1. En Firebase Console, ve a **Authentication** en el menú lateral
2. Click en la pestaña **Método de acceso** (Sign-in method)
3. Click en **Email/Contraseña** (Email/Password)
4. **Activa el interruptor** para habilitarlo
5. Click en **Guardar**

---

### 3️⃣ CREAR TU PRIMER USUARIO (TEMPORAL - SOLO PARA PRUEBAS)

**OPCIÓN A: Desde Firebase Console (Recomendado para pruebas iniciales)**

1. En Firebase Console, ve a **Firestore Database**
2. Click en **Reglas** (Rules)
3. **TEMPORALMENTE** cambia las reglas a esto (SOLO PARA CREAR EL PRIMER USUARIO):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click en **Publicar**
5. Ve a **Authentication** > **Usuarios** > **Agregar usuario**
6. Crea un usuario con:
   - Email: tu@email.com
   - Contraseña: (mínimo 6 caracteres)

**OPCIÓN B: Habilitar registro público temporalmente**

En el archivo `screens/LoginScreen.js`, verifica que la función de registro esté habilitada.

---

### 4️⃣ DESPUÉS DE CREAR TU PRIMER USUARIO

1. Vuelve a **Firestore Database** > **Reglas**
2. **RESTAURA** las reglas originales (copia de nuevo el contenido de `firestore.rules`)
3. Click en **Publicar**

---

### 5️⃣ CREAR ÍNDICES DE FIRESTORE (Para evitar errores de consultas)

Cuando uses la app, si ves errores sobre "índices faltantes":

1. Firebase te dará un **link directo** en el error
2. Click en ese link
3. Click en **Crear índice**
4. Espera 1-2 minutos a que se construya

**O copia manualmente los índices del archivo `FIRESTORE_INDICES.md`**

---

### 6️⃣ CONFIGURAR NOTIFICACIONES PUSH (OPCIONAL - Pero recomendado)

Sigue las instrucciones en: `FCM_PUSH_NOTIFICATIONS.md`

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO:

1. ✅ Aplicar reglas de Firestore (Paso 1)
2. ✅ Habilitar Email/Password (Paso 2)
3. ✅ Crear primer usuario (Paso 3)
4. ✅ Restaurar reglas seguras (Paso 4)
5. ✅ Probar la app
6. ⚠️ Crear índices si hay errores (Paso 5)

---

## 🆘 SI LA APP SIGUE SIN FUNCIONAR:

### Verifica en Firebase Console:

1. **Authentication** > Usuarios debe tener al menos 1 usuario
2. **Firestore Database** > Reglas debe tener las reglas del archivo `firestore.rules`
3. **Firestore Database** > Datos puede estar vacío (se llena al usar la app)

### Errores comunes:

- ❌ "Permission denied" → Las reglas no están aplicadas o el usuario no está autenticado
- ❌ "Auth not initialized" → Recarga la app (presiona R, R)
- ❌ "Missing index" → Crea el índice desde el link del error
- ❌ "Network error" → Verifica tu conexión a internet

---

## 📱 PROBAR LA APP:

1. Escanea el código QR con Expo Go
2. Deberías ver la pantalla de Login
3. Ingresa con el usuario que creaste
4. ¡Listo! Puedes crear tareas

---

## 🔐 SEGURIDAD IMPORTANTE:

⚠️ **NUNCA** dejes las reglas en modo "permisivo" (allow read, write: if true) en producción
⚠️ Las reglas actuales en `firestore.rules` son **SEGURAS** y deben usarse siempre
⚠️ El archivo `.env` con tus credenciales **NO** debe compartirse públicamente

---

## 📞 NECESITAS AYUDA?

Si después de seguir estos pasos la app no funciona, comparte:
1. Captura de pantalla del error
2. Captura de las reglas de Firestore actuales
3. Captura de Authentication > Usuarios
