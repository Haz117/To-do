// screens/HomeScreen.js
// Lista simple de tareas, añade tareas de ejemplo y persiste con AsyncStorage.
// Usa navigation para ir a detalle y chat.
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import TaskItem from '../components/TaskItem';
import FilterBar from '../components/FilterBar';
import { loadTasks, saveTasks } from '../storage';
import * as Notifications from 'expo-notifications';

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [filters, setFilters] = useState({ searchText: '', area: '', responsible: '', priority: '', overdue: false });

  // Cargar tareas cada vez que la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const loaded = await loadTasks();
        setTasks(loaded);
      })();
    }, [])
  );

  // Navegar a pantalla para crear nueva tarea
  const goToCreate = () => navigation.navigate('TaskDetail');

  const openDetail = (task) => {
    navigation.navigate('TaskDetail', { task });
  };

  const openChat = (task) => {
    navigation.navigate('TaskChat', { taskId: task.id, taskTitle: task.title });
  };

  // Aplicar filtros
  const filteredTasks = tasks.filter(task => {
    // Búsqueda por título
    if (filters.searchText && !task.title.toLowerCase().includes(filters.searchText.toLowerCase())) return false;
    // Filtro por área
    if (filters.area && task.area !== filters.area) return false;
    // Filtro por responsable
    if (filters.responsible && task.assignedTo !== filters.responsible) return false;
    // Filtro por prioridad
    if (filters.priority && task.priority !== filters.priority) return false;
    // Filtro por vencidas
    if (filters.overdue && task.dueAt >= Date.now()) return false;
    return true;
  });

  const renderItem = ({ item }) => (
    <TaskItem
      task={item}
      onPress={(t) => openDetail(t)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Tareas</Text>
        <TouchableOpacity style={styles.addButton} onPress={goToCreate}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FilterBar onFilterChange={setFilters} />

      <FlatList
        data={filteredTasks}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TaskItem task={item} onPress={() => openDetail(item)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Sin tareas</Text>
            <Text style={styles.emptySubtext}>Toca + para crear una nueva</Text>
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
  listContent: {
    padding: 20,
    paddingTop: 12
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
