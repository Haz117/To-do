// storage.js
// Archivo temporal para evitar errores de importación
// TODO: Eliminar cuando se actualice services/tasks.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@todo_tasks_v1';

export async function saveTasks(tasks) {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn('Error guardando tareas:', e);
  }
}

export async function loadTasks() {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Error cargando tareas:', e);
    return [];
  }
}
