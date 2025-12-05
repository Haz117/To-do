# 🎯 Sistema de Autenticación con Firestore - TODO App

## ✅ IMPLEMENTADO

### 📂 Archivos Creados/Modificados

1. **services/authFirestore.js** - Sistema de autenticación usando solo Firestore
   - `loginUser(email, password)` - Iniciar sesión
   - `registerUser(email, password, displayName, role)` - Crear usuario
   - `logoutUser()` - Cerrar sesión
   - `getCurrentSession()` - Obtener sesión actual
   - `isAdmin()` - Verificar si es admin

2. **screens/LoginScreen.js** - Pantalla de login/registro
   - Login con email/password
   - Registro de nuevos usuarios (rol: operativo)
   - Validación de formularios
   - Navegación automática tras login exitoso

3. **screens/AdminScreen.js** - Panel de administración
   - Crear usuarios con email/password/rol
   - Solo admins pueden acceder
   - Botón de logout
   - Selector de rol (operativo/admin)

4. **App.js** - Navegación con autenticación
   - Verifica sesión al iniciar
   - Muestra LoginScreen si no hay sesión
   - Muestra Main tabs si está autenticado

5. **screens/MyInboxScreen.js** - Bandeja filtrada
   - Solo muestra tareas asignadas al usuario
   - Filtro por email del usuario actual

6. **firestore.rules** - Reglas de seguridad simplificadas
   - Lectura pública (visitantes pueden ver tareas)
   - Escritura validada en la app

7. **createAdminUser.js** - Script para generar hash de admin

---

## 🚀 PASOS PARA CONFIGURAR

### 1️⃣ Crear Usuario Administrador Inicial

Ve a **Firebase Console** → **Firestore Database** → **Colección `users`**

Crea un nuevo documento con estos campos:

```json
{
  "email": "admin@todo.com",
  "password": "705d9713",
  "displayName": "Administrador",
  "role": "admin",
  "active": true,
  "createdAt": [timestamp actual]
}
```

**Credenciales de login:**
- Email: `admin@todo.com`
- Password: `admin123`

### 2️⃣ Publicar Reglas de Firestore (Opcional)

```bash
firebase deploy --only firestore:rules
```

> **Nota:** Las reglas actuales permiten todo. El control de acceso se hace en la app.

### 3️⃣ Iniciar la App

```bash
npx expo start --clear
```

---

## 📱 FLUJO DE TRABAJO

### Para Visitantes (Sin Login)
- ❌ No pueden acceder a la app
- Deben crear cuenta o tener credenciales

### Para Usuarios Operativos
1. **Login** → Email + contraseña
2. **Mi Bandeja** → Solo ve tareas asignadas a su email
3. **Tareas** → Puede ver todas pero solo editar las asignadas
4. **No puede** → Crear usuarios, eliminar usuarios

### Para Administradores
1. **Login** → Email + contraseña de admin
2. **Tab Admin** → Acceso completo
   - Crear usuarios (email, password, rol)
   - Enviar notificaciones
   - Exportar reportes
3. **Control total** → Ver, crear, editar, eliminar todo

---

## 🔐 NIVELES DE ACCESO

### 👁️ Visitantes (No implementado - requiere login obligatorio)
- Solo lectura de tareas

### 👤 Usuarios Operativos (role: "operativo")
- Ver todas las tareas
- Actualizar tareas asignadas a su email
- Agregar comentarios en el chat
- Recibir notificaciones

### 👑 Administradores (role: "admin")
- **Todo lo de operativos +**
- Crear/editar/eliminar usuarios
- Asignar tareas a cualquier usuario
- Eliminar cualquier tarea
- Enviar notificaciones manuales
- Exportar reportes

---

## 🛠️ GESTIÓN DE USUARIOS

### Crear Usuario Normal (Desde AdminScreen)
1. Login como admin
2. Ir al tab "Admin"
3. Llenar formulario:
   - Nombre
   - Email
   - Contraseña
   - Rol (operativo/admin)
4. Presionar "Crear Usuario"

### Crear Usuario Manualmente (Firebase Console)
1. Ir a Firestore → users
2. Add document
3. Campos requeridos:
   ```
   email: usuario@email.com
   password: [usar createAdminUser.js para hash]
   displayName: Nombre Usuario
   role: operativo
   active: true
   createdAt: [timestamp]
   ```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "Usuario no encontrado"
- Verifica que el email esté correcto
- Verifica que el usuario exista en Firestore collection `users`
- Verifica que `active: true`

### Error: "Contraseña incorrecta"
- El hash se genera con: `simpleHash(password + email)`
- Usa `createAdminUser.js` para generar hashes correctos

### No aparecen tareas en "Mi Bandeja"
- Verifica que la tarea tenga campo `assignedTo` con tu email
- Verifica que iniciaste sesión correctamente
- Revisa console.log para ver el filtro

### "Solo los administradores pueden crear usuarios"
- Verifica que tu usuario tenga `role: "admin"`
- Cierra sesión y vuelve a iniciar

---

## 📊 ESTRUCTURA DE DATOS EN FIRESTORE

### Collection: `users`
```javascript
{
  email: "usuario@email.com",
  password: "hash_de_contraseña",
  displayName: "Nombre Usuario",
  role: "operativo" | "admin",
  active: true,
  createdAt: Timestamp
}
```

### Collection: `tasks`
```javascript
{
  title: "Título de la tarea",
  description: "Descripción",
  assignedTo: "usuario@email.com", // Email del usuario
  status: "pendiente" | "en_proceso" | "cerrada",
  priority: "baja" | "media" | "alta",
  dueAt: Timestamp,
  createdAt: Timestamp,
  // ... otros campos
}
```

---

## 🎨 PRÓXIMAS MEJORAS

1. **Seguridad**
   - [ ] Usar bcrypt para hash de contraseñas
   - [ ] Implementar reglas Firestore más restrictivas
   - [ ] Agregar rate limiting

2. **Funcionalidad**
   - [ ] Recuperar contraseña
   - [ ] Cambiar contraseña desde perfil
   - [ ] Perfil de usuario editable
   - [ ] Lista de usuarios en AdminScreen

3. **UX**
   - [ ] Recordar sesión (opcional)
   - [ ] Modo visitante (solo lectura sin login)
   - [ ] Indicador visual de rol en header

---

## 📝 NOTAS IMPORTANTES

- ⚠️ **Hash simple:** El sistema actual usa un hash básico. En producción, usar bcrypt.
- ⚠️ **Reglas permisivas:** Las reglas de Firestore permiten todo. El control está en la app.
- ✅ **Sin Firebase Auth:** No usa Firebase Authentication, solo Firestore para datos.
- ✅ **AsyncStorage:** La sesión se guarda localmente en el dispositivo.
- ✅ **Tiempo real:** Los cambios en tareas se sincronizan en tiempo real.

---

## 🔗 ARCHIVOS CLAVE

- `services/authFirestore.js` - Lógica de autenticación
- `App.js` - Validación de sesión
- `screens/LoginScreen.js` - UI de login
- `screens/AdminScreen.js` - Gestión de usuarios
- `screens/MyInboxScreen.js` - Filtro de tareas
- `firestore.rules` - Reglas de seguridad
- `createAdminUser.js` - Helper para crear admin

---

**¡Sistema listo para usar!** 🎉

Para empezar:
1. Crea el usuario admin en Firebase Console
2. Inicia la app con `npx expo start --clear`
3. Login con admin@todo.com / admin123
4. Crea usuarios operativos desde el tab Admin
