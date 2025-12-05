# 🚀 GUÍA COMPLETA DE CONFIGURACIÓN - TODO APP

Esta guía te llevará paso a paso para configurar la app desde cero.

---

## 📋 PREREQUISITOS

✅ Node.js instalado
✅ Expo Go en tu celular
✅ Proyecto Firebase creado: **infra-sublime-464215-m5**
✅ Acceso a Firebase Console

---

## 🔥 PASO 1: CONFIGURAR FIREBASE FIRESTORE

### 1.1 Aplicar Reglas de Seguridad

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **infra-sublime-464215-m5**
3. En el menú lateral: **Firestore Database**
4. Click en pestaña **Reglas** (Rules)
5. Borra todo y pega el contenido del archivo `firestore.rules` de tu proyecto
6. Click en **Publicar** (Publish)

**⚠️ Este paso es CRÍTICO - sin las reglas correctas la app no funcionará**

---

## 👥 PASO 2: CREAR USUARIOS

### 2.1 Generar Datos de Usuarios

Ejecuta en PowerShell:

```powershell
cd C:\Users\TI\Documents\TODO
node setupUsers.js
```

Esto mostrará los datos de 5 usuarios predefinidos con sus credenciales.

### 2.2 Crear Usuarios en Firestore

Para **cada usuario** mostrado en el script:

1. Ve a **Firestore Database** en Firebase Console
2. Si no existe la colección `users`, créala:
   - Click en **Iniciar colección**
   - Nombre: `users`
   - Click en **Siguiente**

3. **Agregar documento** (repite para cada usuario):
   - **ID del documento:** Dejar en blanco (auto-generado)
   - **Campos:** Agregar uno por uno:

   ```
   Campo: email
   Tipo: string
   Valor: admin@todo.com (o el email del usuario)
   
   Campo: password
   Tipo: string
   Valor: [copiar el hash del script]
   
   Campo: displayName
   Tipo: string
   Valor: Administrador (o el nombre del usuario)
   
   Campo: role
   Tipo: string
   Valor: admin (o jefe/operativo)
   
   Campo: department
   Tipo: string (o null para admin)
   Valor: null (o juridica/obras/etc)
   
   Campo: active
   Tipo: boolean
   Valor: true
   
   Campo: createdAt
   Tipo: timestamp
   Valor: [Click en el reloj y selecciona fecha actual]
   ```

4. Click en **Guardar**
5. Repite para los otros 4 usuarios

---

## 📱 PASO 3: CONFIGURAR LA APP

### 3.1 Instalar Dependencias

```powershell
cd C:\Users\TI\Documents\TODO
npm install
```

### 3.2 Iniciar Expo

```powershell
npx expo start
```

### 3.3 Escanear QR

1. Abre **Expo Go** en tu celular
2. Escanea el código QR que aparece en la terminal
3. Espera a que cargue la app

---

## 🔐 PASO 4: PROBAR LOGIN

### Usuarios Disponibles (después de crear en Firestore):

| Email | Password | Rol | Permisos |
|-------|----------|-----|----------|
| admin@todo.com | admin123 | admin | Ve y edita TODO |
| jefe.juridica@todo.com | jefe123 | jefe | Solo área Jurídica |
| jefe.obras@todo.com | jefe123 | jefe | Solo área Obras |
| operativo.juridica@todo.com | oper123 | operativo | Solo tareas asignadas |
| operativo.obras@todo.com | oper123 | operativo | Solo tareas asignadas |

### 4.1 Login Inicial

1. Abre la app en tu celular
2. Deberías ver la pantalla de **Login**
3. Ingresa:
   - Email: `admin@todo.com`
   - Password: `admin123`
4. Click en **Iniciar sesión**

**✅ Si entras, ¡felicidades! Todo está funcionando.**

---

## 📊 PASO 5: CREAR ÍNDICES DE FIRESTORE

Cuando uses la app por primera vez, pueden aparecer errores sobre "índices faltantes".

### Opción A: Crear automáticamente (Recomendado)
1. El error te dará un **link directo**
2. Click en el link
3. Click en **Crear índice**
4. Espera 1-2 minutos

### Opción B: Crear manualmente
1. Ve a **Firestore Database** → **Índices**
2. Click en **Agregar índice**
3. Agrega estos índices:

**Índice 1: Tareas por área**
- Colección: `tasks`
- Campos:
  - `area` (Ascendente)
  - `createdAt` (Descendente)
- Estado de la consulta: Habilitado

**Índice 2: Tareas por asignado**
- Colección: `tasks`
- Campos:
  - `assignedTo` (Ascendente)
  - `createdAt` (Descendente)
- Estado de la consulta: Habilitado

---

## 🎯 PASO 6: VERIFICAR PERMISOS

### 6.1 Probar como Admin
1. Login con `admin@todo.com`
2. Deberías ver **todas las tareas**
3. Puedes **crear** tareas
4. Puedes **eliminar** tareas
5. Puedes **editar** cualquier tarea

### 6.2 Probar como Jefe
1. Logout (si hay botón) o cierra y vuelve a abrir la app
2. Login con `jefe.juridica@todo.com` / `jefe123`
3. Solo deberías ver **tareas de Jurídica**
4. Puedes **crear** tareas (solo en Jurídica)
5. **NO** puedes eliminar tareas
6. Puedes **editar** tareas de Jurídica

### 6.3 Probar como Operativo
1. Login con `operativo.juridica@todo.com` / `oper123`
2. Solo ves **tareas asignadas a ti**
3. **NO** puedes crear tareas
4. **NO** puedes eliminar tareas
5. Solo puedes **cambiar el estado** de tus tareas

---

## 🔧 PASO 7: CONFIGURACIONES OPCIONALES

### 7.1 Notificaciones Push
Ver archivo: `FCM_PUSH_NOTIFICATIONS.md`

### 7.2 Personalizar Usuarios
Edita el archivo `setupUsers.js` y agrega más usuarios según necesites.

### 7.3 Agregar más Departamentos
Edita `services/roles.js` para agregar departamentos.

---

## ❌ SOLUCIÓN DE PROBLEMAS

### Error: "Permission denied"
- ✅ Verifica que aplicaste las reglas de `firestore.rules`
- ✅ Verifica que el usuario existe en Firestore
- ✅ Verifica que `active: true`

### Error: "Usuario no encontrado"
- ✅ Verifica que creaste el usuario en Firestore
- ✅ Verifica que el email esté en minúsculas
- ✅ Verifica el hash del password (debe coincidir con el del script)

### Error: "Missing index"
- ✅ Click en el link del error para crear el índice
- ✅ O crea manualmente desde Firestore → Índices

### La app no carga
- ✅ Verifica tu conexión a internet
- ✅ Presiona `R` dos veces en la terminal para recargar
- ✅ Revisa que todas las dependencias estén instaladas

### No veo todas las tareas (siendo admin)
- ✅ Verifica en Firestore que tu rol sea exactamente `"admin"`
- ✅ Cierra y vuelve a abrir la app
- ✅ Verifica que las tareas existan en Firestore

---

## 📞 CHECKLIST FINAL

Antes de usar en producción, verifica:

- [ ] Reglas de Firestore aplicadas (`firestore.rules`)
- [ ] Al menos 1 usuario admin creado en Firestore
- [ ] Índices de Firestore creados
- [ ] Login funciona con admin
- [ ] Puedes crear tareas
- [ ] Los permisos funcionan correctamente
- [ ] Las notificaciones están configuradas (opcional)
- [ ] Has cambiado las contraseñas por defecto

---

## 🎉 ¡LISTO!

Tu app TODO está completamente configurada y lista para usar.

### Próximos pasos:
1. Cambia las contraseñas por defecto
2. Crea más usuarios según necesites
3. Configura notificaciones push
4. Personaliza las áreas/departamentos
5. Despliega en producción siguiendo `GUIA_DESPLIEGUE.md`

---

## 📚 DOCUMENTACIÓN ADICIONAL

- `README.md` - Información general del proyecto
- `SISTEMA_AUTENTICACION.md` - Detalles del sistema de auth
- `IMPLEMENTACION_PERMISOS_REAL.md` - Cómo funcionan los permisos
- `GUIA_DESPLIEGUE.md` - Deploy a producción
- `GUIA_USUARIO.md` - Manual para usuarios finales
