// services/user.js
// Helper para guardar/leer el usuario actual (simula login simple)
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@current_user';

export async function loadCurrentUser() {
  try {
    const s = await AsyncStorage.getItem(USER_KEY);
    return s || 'Usuario A';
  } catch (e) {
    console.warn('Error cargando usuario actual', e);
    return 'Usuario A';
  }
}

export async function saveCurrentUser(name) {
  try {
    await AsyncStorage.setItem(USER_KEY, name);
  } catch (e) {
    console.warn('Error guardando usuario actual', e);
  }
}
