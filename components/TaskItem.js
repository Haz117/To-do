// components/TaskItem.js
// Componente que muestra título, fecha límite, usuario asignado y un countdown en vivo.
// Propiedades:
// - task: { id, title, description, dueAt (ISO/string/number), assignedTo }
// - onPress: función al presionar el item
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

function formatRemaining(ms) {
  if (ms <= 0) return 'Vencida';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

export default function TaskItem({ task, onPress }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    // Actualiza cada segundo para el countdown en vivo
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const due = new Date(task.dueAt).getTime();
  const remaining = due - now;

  return (
    <TouchableOpacity 
      onPress={() => onPress && onPress(task)} 
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={[styles.badge, remaining <= 0 ? styles.badgeExpired : null]}>
          {formatRemaining(remaining)}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {task.area || 'Sin área'} • {task.assignedTo || 'Sin asignar'}
        </Text>
        <Text style={styles.metaSmall}>{new Date(task.dueAt).toLocaleDateString()}</Text>
      </View>
      {task.priority && (
        <View style={styles.priorityRow}>
          <Text style={[styles.priorityBadge, task.priority === 'alta' && styles.priorityHigh, task.priority === 'media' && styles.priorityMedium]}>
            {task.priority.toUpperCase()}
          </Text>
          <Text style={styles.statusText}>{task.status === 'en_proceso' ? 'En proceso' : task.status === 'en_revision' ? 'En revisión' : task.status || 'Pendiente'}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 12
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1A1A1A', 
    flex: 1, 
    marginRight: 12,
    letterSpacing: -0.5,
    lineHeight: 24
  },
  badge: {
    backgroundColor: '#34C759',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'center'
  },
  badgeExpired: { 
    backgroundColor: '#FF3B30'
  },
  metaRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10,
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  meta: { 
    color: '#6E6E73', 
    fontSize: 14, 
    fontWeight: '500',
    letterSpacing: 0.1
  },
  metaSmall: { 
    color: '#AEAEB2', 
    fontSize: 13,
    fontWeight: '500'
  },
  priorityRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flexWrap: 'wrap',
    gap: 10
  },
  priorityBadge: { 
    fontSize: 11, 
    fontWeight: '700', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 6, 
    backgroundColor: '#F2F2F7', 
    color: '#6E6E73',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  priorityHigh: { 
    backgroundColor: '#FFEBEE', 
    color: '#FF3B30'
  },
  priorityMedium: { 
    backgroundColor: '#FFF3E0', 
    color: '#FF9500'
  },
  statusText: { 
    fontSize: 13, 
    color: '#8E8E93', 
    fontWeight: '500',
    fontStyle: 'italic'
  }
});
