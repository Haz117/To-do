// storage.js
// Helpers simples para guardar y cargar la lista de tareas en AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@todo_tasks_v1';

// Guarda array de tareas (serializa JSON)
export async function saveTasks(tasks) {
  try {
    const s = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY, s);
  } catch (e) {
    console.warn('Error guardando tareas en AsyncStorage', e);
  }
}

// Carga tareas (si no hay nada devuelve array vacío)
export async function loadTasks() {
  try {
    const s = await AsyncStorage.getItem(TASKS_KEY);
    return s ? JSON.parse(s) : [];
  } catch (e) {
    console.warn('Error cargando tareas desde AsyncStorage', e);
    return [];
  }
}
