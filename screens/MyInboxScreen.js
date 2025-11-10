// screens/MyInboxScreen.js
// "Mi bandeja" - lista de tareas asignadas al usuario actual, ordenadas por fecha de vencimiento.
// Acciones rápidas: marcar cerrada y posponer 1 día. Abre detalle y chat.
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TaskItem from '../components/TaskItem';
import { loadTasks, saveTasks } from '../storage';
import { loadCurrentUser, saveCurrentUser } from '../services/user';
import { scheduleNotificationForTask, cancelNotification } from '../services/notifications';

export default function MyInboxScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [editingUser, setEditingUser] = useState('');

  useEffect(() => {
    (async () => {
      const t = await loadTasks();
      setTasks(t || []);
      const u = await loadCurrentUser();
      setCurrentUser(u);
      setEditingUser(u);
    })();
  }, []);

  // Guarda usuario
  const saveUser = async () => {
    await saveCurrentUser(editingUser.trim() || 'Usuario A');
    setCurrentUser(editingUser.trim() || 'Usuario A');
    Alert.alert('Usuario guardado', `Usuario actual: ${editingUser.trim() || 'Usuario A'}`);
  };

  // Actualiza tareas en storage y estado
  const persistTasks = async (newTasks) => {
    setTasks(newTasks);
    await saveTasks(newTasks);
  };

  const filtered = tasks
    .filter(t => t.assignedTo && t.assignedTo.toLowerCase() === (currentUser || '').toLowerCase())
    .sort((a, b) => (a.dueAt || 0) - (b.dueAt || 0));

  const markClosed = async (task) => {
    try {
      const all = tasks.map(t => (t.id === task.id ? { ...t, status: 'cerrada', updatedAt: Date.now() } : t));
      // cancelar notificación existente
      if (task.notificationId) await cancelNotification(task.notificationId);
      await persistTasks(all);
    } catch (e) {
      console.warn('Error marcando cerrada', e);
    }
  };

  const postponeOneDay = async (task) => {
    try {
      const newDue = (task.dueAt || Date.now()) + 24 * 3600 * 1000; // +1 día
      const updatedTask = { ...task, dueAt: newDue, updatedAt: Date.now() };
      // cancelar notificación previa
      if (task.notificationId) await cancelNotification(task.notificationId);
      // reprogramar notificación 10 minutos antes
      const notifId = await scheduleNotificationForTask(updatedTask, { minutesBefore: 10 });
      if (notifId) updatedTask.notificationId = notifId;

      const all = tasks.map(t => (t.id === task.id ? updatedTask : t));
      await persistTasks(all);
    } catch (e) {
      console.warn('Error posponiendo tarea', e);
    }
  };

  const openDetail = (task) => navigation.navigate('TaskDetail', { task });
  const openChat = (task) => navigation.navigate('TaskChat', { taskId: task.id, taskTitle: task.title });
  const goToCreate = () => navigation.navigate('TaskDetail');

  const renderItem = ({ item }) => (
    <View style={{ marginBottom: 12 }}>
      <TaskItem task={item} onPress={() => openDetail(item)} />
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => markClosed(item)}>
          <Text style={styles.actionText}>✓ Cerrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => postponeOneDay(item)}>
          <Text style={styles.actionText}>⏰ Posponer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={() => openChat(item)}>
          <Text style={[styles.actionText, {color: '#fff'}]}>💬 Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Mi Bandeja</Text>
        <TouchableOpacity style={styles.addButton} onPress={goToCreate}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userSection}>
        <Text style={styles.userLabel}>USUARIO ACTUAL</Text>
        <View style={styles.userRow}>
          <TextInput style={styles.input} value={editingUser} onChangeText={setEditingUser} placeholder="Tu nombre" placeholderTextColor="#C7C7CC" />
          <TouchableOpacity style={styles.saveBtn} onPress={saveUser}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.currentUser}>{currentUser || 'No configurado'}</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Sin tareas</Text>
            <Text style={styles.emptySubtext}>No hay tareas asignadas</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAFAFA'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 16,
    backgroundColor: '#FAFAFA'
  },
  heading: { 
    fontSize: 38, 
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -1
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    marginBottom: 2
  },
  userSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  userLabel: {
    fontSize: 12,
    color: '#6E6E73',
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  userRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 12
  },
  input: { 
    flex: 1, 
    padding: 14, 
    backgroundColor: '#F2F2F7', 
    borderRadius: 12,
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500'
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  currentUser: {
    marginTop: 12,
    fontSize: 15,
    color: '#6E6E73',
    fontWeight: '500'
  },
  listContent: {
    padding: 20
  },
  actionsRow: { 
    flexDirection: 'row', 
    marginTop: 12,
    gap: 10
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5EA'
  },
  actionBtnPrimary: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: 0.2
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 120,
    paddingHorizontal: 40
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22
  }
});
