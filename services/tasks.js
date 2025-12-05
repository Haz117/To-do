// services/tasks.js
// Servicio para gestionar tareas con Firebase Firestore en tiempo real
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { loadTasks as loadLocal, saveTasks as saveLocal } from '../storage';
import { getCurrentSession } from './authFirestore';

const COLLECTION_NAME = 'tasks';

// Cache en memoria para reducir lecturas
let cachedTasks = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 segundos

/**
 * Suscribirse a cambios en tiempo real de las tareas del usuario autenticado
 * @param {Function} callback - Función que recibe el array de tareas actualizado
 * @returns {Function} Función para cancelar la suscripción
 */
export async function subscribeToTasks(callback) {
  try {
    // Obtener sesión del usuario actual
    const sessionResult = await getCurrentSession();
    if (!sessionResult.success) {
      console.warn('Usuario no autenticado, no se pueden cargar tareas');
      callback([]);
      return () => {};
    }

    const userRole = sessionResult.session.role;
    const userEmail = sessionResult.session.email;
    const userDepartment = sessionResult.session.department;

    // Enviar cache inmediatamente para UX rápido
    if (cachedTasks.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
      callback(cachedTasks);
    }

    let tasksQuery;

    // Construir query según el rol del usuario
    if (userRole === 'admin') {
      // Admin: Ver todas las tareas
      tasksQuery = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'jefe') {
      // Jefe: Solo tareas de su departamento/área
      tasksQuery = query(
        collection(db, COLLECTION_NAME),
        where('area', '==', userDepartment),
        orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'operativo') {
      // Operativo: Solo tareas asignadas a él
      tasksQuery = query(
        collection(db, COLLECTION_NAME),
        where('assignedTo', '==', userEmail),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Sin rol definido: sin acceso
      console.warn('Usuario sin rol definido');
      callback([]);
      return () => {};
    }

    // Listener en tiempo real
    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convertir Timestamps de Firebase a milisegundos
          createdAt: doc.data().createdAt?.toMillis() || Date.now(),
          updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
          dueAt: doc.data().dueAt?.toMillis() || Date.now()
        }));
        
        // Actualizar cache
        cachedTasks = tasks;
        lastFetchTime = Date.now();
        
        // Guardar copia local como backup (sin bloquear)
        saveLocal(tasks).catch(err => console.warn('Error guardando backup local:', err));
        
        callback(tasks);
      },
      (error) => {
        console.error('Error en subscripción de Firebase:', error);
        // Fallback: cargar desde AsyncStorage si Firebase falla
        loadLocal().then(tasks => {
          cachedTasks = tasks;
          callback(tasks);
        });
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error configurando subscripción:', error);
    // Fallback: cargar desde AsyncStorage
    loadLocal().then(tasks => {
      cachedTasks = tasks;
      callback(tasks);
    });
    return () => {}; // Retornar función vacía
  }
}

/**
 * Crear una nueva tarea en Firebase con información del usuario
 * @param {Object} task - Objeto con datos de la tarea
 * @returns {Promise<string>} ID de la tarea creada
 */
export async function createTask(task) {
  const tempId = `temp_${Date.now()}`;
  
  try {
    // Obtener información del usuario actual
    const sessionResult = await getCurrentSession();
    const currentUserUID = sessionResult.success ? sessionResult.session.userId : 'anonymous';
    const currentUserName = sessionResult.success ? sessionResult.session.displayName : 'Usuario Anónimo';

    // OPTIMISTIC UPDATE: Actualizar cache inmediatamente
    const optimisticTask = {
      ...task,
      id: tempId,
      createdBy: currentUserUID,
      createdByName: currentUserName,
      department: task.department || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueAt: task.dueAt,
      _optimistic: true
    };
    
    cachedTasks = [optimisticTask, ...cachedTasks];

    const taskData = {
      ...task,
      createdBy: currentUserUID,
      createdByName: currentUserName,
      department: task.department || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      dueAt: Timestamp.fromMillis(task.dueAt)
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), taskData);
    console.log('✅ Tarea creada en Firebase:', docRef.id);
    
    // Reemplazar tarea optimista con la real
    cachedTasks = cachedTasks.filter(t => t.id !== tempId);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creando tarea en Firebase:', error);
    // Remover tarea optimista en caso de error
    cachedTasks = cachedTasks.filter(t => t.id !== tempId);
    
    // Lanzar error con mensaje específico
    if (error.code === 'permission-denied') {
      throw new Error('No tienes permisos para crear tareas');
    } else if (error.code === 'unavailable') {
      throw new Error('Sin conexión. Verifica tu red e intenta nuevamente');
    } else if (error.code === 'resource-exhausted') {
      throw new Error('Límite de operaciones excedido. Intenta más tarde');
    } else {
      throw new Error(`Error al crear tarea: ${error.message}`);
    }
  }
}

/**
 * Actualizar una tarea existente
 * @param {string} taskId - ID de la tarea
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<void>}
 */
export async function updateTask(taskId, updates) {
  // OPTIMISTIC UPDATE: Actualizar cache inmediatamente
  const taskIndex = cachedTasks.findIndex(t => t.id === taskId);
  const previousTask = taskIndex >= 0 ? { ...cachedTasks[taskIndex] } : null;
  
  if (taskIndex >= 0) {
    cachedTasks[taskIndex] = {
      ...cachedTasks[taskIndex],
      ...updates,
      updatedAt: Date.now(),
      _optimistic: true
    };
  }
  
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Convertir dueAt a Timestamp si existe
    if (updates.dueAt) {
      updateData.dueAt = Timestamp.fromMillis(updates.dueAt);
    }

    await updateDoc(taskRef, updateData);
    console.log('✅ Tarea actualizada en Firebase:', taskId);
    
    // Remover flag optimista
    if (taskIndex >= 0) {
      delete cachedTasks[taskIndex]._optimistic;
    }
  } catch (error) {
    console.error('❌ Error actualizando tarea en Firebase:', error);
    
    // ROLLBACK: Restaurar estado anterior
    if (previousTask && taskIndex >= 0) {
      cachedTasks[taskIndex] = previousTask;
    }
    
    // Lanzar error con mensaje específico
    if (error.code === 'permission-denied') {
      throw new Error('No tienes permisos para modificar esta tarea');
    } else if (error.code === 'not-found') {
      throw new Error('La tarea no existe o fue eliminada');
    } else if (error.code === 'unavailable') {
      throw new Error('Sin conexión. Verifica tu red e intenta nuevamente');
    } else {
      throw new Error(`Error al actualizar: ${error.message}`);
    }
  }
}

/**
 * Eliminar una tarea
 * @param {string} taskId - ID de la tarea a eliminar
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId) {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await deleteDoc(taskRef);
    console.log('✅ Tarea eliminada de Firebase:', taskId);
  } catch (error) {
    console.error('❌ Error eliminando tarea de Firebase:', error);
    
    // Lanzar error con mensaje específico
    if (error.code === 'permission-denied') {
      throw new Error('No tienes permisos para eliminar esta tarea');
    } else if (error.code === 'not-found') {
      throw new Error('La tarea no existe o ya fue eliminada');
    } else if (error.code === 'unavailable') {
      throw new Error('Sin conexión. Verifica tu red e intenta nuevamente');
    } else {
      throw new Error(`Error al eliminar: ${error.message}`);
    }
  }
}

/**
 * Cargar tareas (fallback si Firebase no está disponible)
 * @returns {Promise<Array>} Array de tareas
 */
export async function loadTasks() {
  return await loadLocal();
}
