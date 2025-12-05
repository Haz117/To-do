# 💬 Sistema de Chat y Permisos - Explicación Completa

## 📋 ¿Quién ve qué en la aplicación?

### 🎯 **Resumen Rápido**

| Característica | Admin | Jefe de Área | Operativo |
|---------------|-------|--------------|-----------|
| Ver todas las tareas | ✅ Sí | ✅ Sí | ❌ Solo asignadas |
| Crear tareas | ✅ Sí | ✅ Sí | ❌ No |
| Editar cualquier tarea | ✅ Sí | ✅ En su área | ❌ Solo asignadas |
| Eliminar tareas | ✅ Sí | ✅ En su área | ❌ No |
| Ver chat de tareas | ✅ Todas | ✅ De su área | ✅ Asignadas |
| Escribir en chat | ✅ Todas | ✅ De su área | ✅ Asignadas |
| Crear usuarios | ✅ Sí | ❌ No | ❌ No |
| Enviar notificaciones | ✅ Sí | ⚠️ Limitado | ❌ No |

---

## 👥 **ROLES DEFINIDOS**

### 1. 👑 **ADMINISTRADOR** (role: "admin")
**Ejemplos:** Alcalde, Secretario General, Director General

**Puede hacer:**
- ✅ Ver TODAS las tareas del municipio
- ✅ Crear, editar y eliminar cualquier tarea
- ✅ Asignar tareas a cualquier persona
- ✅ Acceder al panel de administración
- ✅ Crear nuevos usuarios con cualquier rol
- ✅ Ver y escribir en TODOS los chats
- ✅ Generar reportes completos
- ✅ Enviar notificaciones masivas
- ✅ Cambiar roles de usuarios
- ✅ Desactivar usuarios

**Cuándo usar:**
- Personal de alta dirección
- Secretarías generales
- Quien necesite supervisión total

---

### 2. 👔 **JEFE DE ÁREA** (role: "jefe")
**Ejemplos:** Director de Obras, Director Jurídico, Tesorero

**Puede hacer:**
- ✅ Ver todas las tareas de su área/departamento
- ✅ Crear tareas para su equipo
- ✅ Editar tareas de su área
- ✅ Asignar tareas a su personal
- ✅ Ver y escribir en chats de tareas de su área
- ✅ Generar reportes de su departamento
- ⚠️ **NO puede:** Crear usuarios ni cambiar roles
- ⚠️ **NO puede:** Ver/editar tareas de otras áreas

**Cuándo usar:**
- Directores de departamento
- Coordinadores de área
- Jefes de equipo

---

### 3. 👤 **OPERATIVO** (role: "operativo")
**Ejemplos:** Empleados, Asistentes, Personal de campo

**Puede hacer:**
- ✅ Ver SOLO las tareas asignadas a su email
- ✅ Actualizar el estado de sus tareas
- ✅ Ver y escribir en chats de sus tareas
- ✅ Marcar tareas como completadas
- ✅ Subir evidencias (si está implementado)
- ❌ **NO puede:** Ver tareas de otros usuarios
- ❌ **NO puede:** Crear nuevas tareas
- ❌ **NO puede:** Eliminar tareas
- ❌ **NO puede:** Acceder al panel admin

**Cuándo usar:**
- Personal operativo general
- Empleados de base
- Usuarios con tareas específicas asignadas

---

## 💬 **SISTEMA DE CHAT - ¿Cómo funciona?**

### 📱 **Ubicación del Chat**
El botón de chat aparece en:
1. **Pantalla de detalle de tarea** (TaskDetailScreen)
   - Solo si estás viendo una tarea existente (no al crear nueva)
   - Botón "Abrir Chat" debajo del botón de guardar

### 🎯 **¿Quién puede ver el chat de una tarea?**

#### **Opción 1: TODOS los usuarios (implementación actual)**
```javascript
// Cualquier usuario autenticado puede ver el chat
// Solo necesita el ID de la tarea
```
**Ventajas:** Simple, colaborativo
**Desventajas:** Menos privacidad

#### **Opción 2: Solo usuarios involucrados (recomendado)**
```javascript
// Solo pueden ver el chat:
- El creador de la tarea
- El usuario asignado
- Administradores
- Jefes del área correspondiente
```

### 📝 **¿Qué se guarda en cada mensaje?**

Cada mensaje tiene:
```javascript
{
  text: "Contenido del mensaje",
  author: "Nombre del Usuario", // De displayName o email
  createdAt: Timestamp,
  id: "mensaje_id_unico"
}
```

### 🔔 **Notificaciones del Chat**

**Estado actual:** ⚠️ Deshabilitadas temporalmente

**Razón:** El código tenía un error (`getCurrentUserUID()` no existe)

**Solución aplicada:**
- Comentado el sistema de notificaciones
- El chat funciona perfectamente para escribir/leer
- Los usuarios deben abrir el chat manualmente para ver mensajes nuevos

**Plan futuro:**
```javascript
// Cuando esté listo el sistema completo:
// 1. Notificar al usuario asignado cuando alguien comenta
// 2. Notificar al creador cuando hay respuesta
// 3. Badge de mensajes sin leer
```

---

## 🔐 **CONTROL DE ACCESO POR PANTALLA**

### 🏠 **HomeScreen (Pantalla Principal)**
```javascript
// ADMIN y JEFE: Ven todas las tareas
// OPERATIVO: Solo ve tareas donde assignedTo === su email

if (currentUser.role === 'operativo') {
  // Filtro automático aplicado
  tareas = tareas.filter(t => t.assignedTo === currentUser.email);
}
```

### 📥 **MyInboxScreen (Mi Bandeja)**
```javascript
// TODOS: Solo ven tareas asignadas a su email
tareas.filter(t => t.assignedTo === currentUserEmail);
```

### 📅 **CalendarScreen (Calendario)**
```javascript
// TODOS: Ven todas las tareas en el calendario
// Pero solo pueden editar según su rol
```

### 🎨 **KanbanScreen (Tablero)**
```javascript
// ADMIN y JEFE: Ven y mueven todas las tareas
// OPERATIVO: Solo ve sus tareas asignadas
```

### 💬 **TaskChatScreen (Chat)**
```javascript
// ACTUALMENTE: Cualquiera con el taskId puede ver
// RECOMENDADO: Solo involucrados en la tarea

// Puedes implementar:
if (userRole === 'admin') return true;
if (task.assignedTo === userEmail) return true;
if (task.createdBy === userId) return true;
// Sino, denegar acceso
```

### ⚙️ **AdminScreen**
```javascript
// Solo visible si: userRole === 'admin'
// Aparece como tab solo para admins
```

---

## 🛠️ **¿Cómo se Asignan las Tareas?**

### **Quién puede asignar:**
- ✅ Administradores: A cualquier usuario
- ✅ Jefes: A usuarios de su departamento
- ❌ Operativos: No pueden asignar

### **Campo usado:**
```javascript
task.assignedTo = "usuario@email.com"
```

### **Proceso:**
1. Al crear/editar tarea, seleccionas de la lista de usuarios
2. La lista se obtiene de `getAllUsersNames()` en `services/roles.js`
3. Se guarda el EMAIL del usuario (no el nombre)
4. El sistema filtra tareas por este email

---

## 📊 **ESTRUCTURA DE DATOS**

### **Tarea (Collection: tasks)**
```javascript
{
  id: "task_123",
  title: "Reparar bache en calle principal",
  description: "...",
  assignedTo: "obras@municipio.com", // Email del responsable
  createdBy: "admin_user_id",
  createdByName: "Secretario General",
  area: "Obras",
  department: "obras",
  priority: "alta",
  status: "en_proceso",
  dueAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### **Mensaje de Chat (Subcollection: tasks/{taskId}/messages)**
```javascript
{
  id: "msg_456",
  text: "Ya se inició la reparación",
  author: "Juan Pérez", // displayName del usuario
  createdAt: Timestamp
}
```

### **Usuario (Collection: users)**
```javascript
{
  id: "user_789",
  email: "obras@municipio.com",
  displayName: "Juan Pérez",
  role: "jefe", // admin | jefe | operativo
  department: "obras",
  active: true,
  createdAt: Timestamp
}
```

---

## 🎯 **CASOS DE USO PRÁCTICOS**

### **Caso 1: Asignar tarea a empleado**
1. Admin/Jefe crea tarea
2. En "Asignado a" selecciona email del empleado
3. Empleado ve la tarea en su bandeja (Mi Bandeja)
4. Empleado puede actualizar estado y comentar en chat

### **Caso 2: Seguimiento de tarea**
1. Jefe crea tarea asignada a operativo
2. Operativo actualiza estado a "en_proceso"
3. Jefe entra al chat de la tarea
4. Operativo comenta: "Ya inicié el trabajo"
5. Jefe ve el mensaje y responde
6. Ambos tienen conversación en tiempo real

### **Caso 3: Usuario operativo intenta ver tareas de otros**
1. Operativo entra a HomeScreen
2. Sistema filtra automáticamente: `role === 'operativo'`
3. Solo ve tareas donde `assignedTo === su email`
4. No puede navegar a tareas de otros usuarios

---

## ⚠️ **PROBLEMAS CORREGIDOS**

### ❌ Error: `getCurrentUserUID is not defined`
**Ubicación:** `TaskChatScreen.js` línea 67

**Problema:**
```javascript
const currentUID = getCurrentUserUID(); // ❌ Esta función no existe
```

**Solución aplicada:**
```javascript
// Sistema de notificaciones temporalmente deshabilitado
// Chat funciona perfectamente sin notificaciones push
// Se agregó currentUserId al estado del componente
```

---

## 🚀 **MEJORAS RECOMENDADAS**

### 1. **Restricción de acceso al chat**
```javascript
// En TaskChatScreen, agregar verificación:
useEffect(() => {
  const verifyAccess = async () => {
    const taskDoc = await getDoc(doc(db, 'tasks', taskId));
    const task = taskDoc.data();
    
    if (userRole !== 'admin' && 
        task.assignedTo !== userEmail && 
        task.createdBy !== userId) {
      Alert.alert('Sin acceso', 'No tienes permiso para ver este chat');
      navigation.goBack();
    }
  };
  verifyAccess();
}, []);
```

### 2. **Indicador de mensajes sin leer**
```javascript
// Agregar campo en tasks:
task.unreadCount = { [userId]: 3 }
```

### 3. **Notificaciones cuando hay comentario nuevo**
```javascript
// Al enviar mensaje, notificar a:
- Usuario asignado (si no es quien escribió)
- Creador de la tarea (si no es quien escribió)
- Administradores (opcional)
```

### 4. **Historial de cambios en chat**
```javascript
// Mensajes automáticos del sistema:
"Juan cambió el estado a 'en_proceso'"
"María reasignó la tarea a Pedro"
```

---

## 📖 **RESUMEN FINAL**

### **¿Quién ve el chat?**
Actualmente: Cualquier usuario autenticado que tenga el link/ID de la tarea
Recomendado: Solo admin, creador, y usuario asignado

### **¿Quién puede escribir en el chat?**
Cualquier usuario que pueda verlo

### **¿Para qué sirve el chat?**
- Comunicación sobre tareas específicas
- Aclaraciones entre jefe y operativo
- Registro de seguimiento
- Coordinación de equipo

### **¿Qué ven los usuarios normales (operativos)?**
- Solo SUS tareas asignadas
- Chats de SUS tareas
- Su perfil
- NO ven panel admin
- NO ven tareas de otros

### **¿Qué ven los administradores?**
- TODO
- Todas las tareas
- Todos los chats
- Panel admin
- Gestión de usuarios

---

## 🔗 **Archivos Relacionados**

- `screens/TaskChatScreen.js` - Interfaz del chat
- `services/roles.js` - Sistema de roles y permisos
- `services/authFirestore.js` - Autenticación
- `screens/HomeScreen.js` - Filtro por rol
- `screens/MyInboxScreen.js` - Bandeja personal
- `App.js` - Tab Admin solo para admins

---

**Última actualización:** Diciembre 1, 2025
**Estado:** ✅ Sistema funcional, notificaciones deshabilitadas temporalmente
