// services/notifications.js
// Helpers para programar y cancelar notificaciones locales usando expo-notifications
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Pide permisos si es necesario. Devuelve true si se concedieron.
export async function ensurePermissions() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

// Programa una notificación 10 minutos antes de la fecha límite (dueAt en ms o Date)
// Devuelve el id de la notificación programada o null si no se programó.
export async function scheduleNotificationForTask(task, options = { minutesBefore: 10 }) {
  try {
    const granted = await ensurePermissions();
    if (!granted) return null;

    const due = typeof task.dueAt === 'number' ? new Date(task.dueAt) : new Date(task.dueAt);
    const triggerDate = new Date(due.getTime() - options.minutesBefore * 60 * 1000);

    // Si el trigger ya pasó, no programamos
    if (triggerDate <= new Date()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio: ' + (task.title || 'Tarea'),
        body: `La tarea "${task.title}" vence en ${options.minutesBefore} minutos.`,
        data: { taskId: task.id }
      },
      trigger: triggerDate
    });

    return id;
  } catch (e) {
    console.warn('Error programando notificación', e);
    return null;
  }
}

// Programa recordatorios diarios cada 24 horas para tareas no cerradas
// Devuelve array de IDs de notificaciones programadas
export async function scheduleDailyReminders(task) {
  try {
    const granted = await ensurePermissions();
    if (!granted) return [];

    // Solo programar para tareas que no están cerradas
    if (task.status === 'cerrada') return [];

    const ids = [];
    const now = new Date();
    const due = typeof task.dueAt === 'number' ? new Date(task.dueAt) : new Date(task.dueAt);
    
    // Programar recordatorios cada 24 horas hasta la fecha de vencimiento
    let reminderDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 día
    
    while (reminderDate < due) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Recordatorio diario',
          body: `Tarea pendiente: "${task.title}" - Vence: ${due.toLocaleDateString()}`,
          data: { taskId: task.id, type: 'daily_reminder' }
        },
        trigger: reminderDate
      });
      ids.push(id);
      reminderDate = new Date(reminderDate.getTime() + 24 * 60 * 60 * 1000); // +1 día más
    }

    return ids;
  } catch (e) {
    console.warn('Error programando recordatorios diarios', e);
    return [];
  }
}

// Notificación al asignar tarea
export async function notifyAssignment(task) {
  try {
    const granted = await ensurePermissions();
    if (!granted) return null;

    if (!task.assignedTo) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 Nueva tarea asignada',
        body: `Te han asignado: "${task.title}" - Vence: ${new Date(task.dueAt).toLocaleDateString()}`,
        data: { taskId: task.id, type: 'assignment' }
      },
      trigger: null // Notificación inmediata
    });

    return id;
  } catch (e) {
    console.warn('Error enviando notificación de asignación', e);
    return null;
  }
}

export async function cancelNotification(notificationId) {
  try {
    if (!notificationId) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.warn('Error cancelando notificación', e);
  }
}

// Cancelar múltiples notificaciones
export async function cancelNotifications(notificationIds = []) {
  try {
    if (!notificationIds || notificationIds.length === 0) return;
    await Promise.all(notificationIds.map(id => Notifications.cancelScheduledNotificationAsync(id)));
  } catch (e) {
    console.warn('Error cancelando notificaciones', e);
  }
}
