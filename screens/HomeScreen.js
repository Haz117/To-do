// screens/HomeScreen.js
// Lista simple de tareas, añade tareas de ejemplo y persiste con AsyncStorage.
// Usa navigation para ir a detalle y chat.
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, Alert, TouchableOpacity, RefreshControl, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TaskItem from '../components/TaskItem';
import FilterBar from '../components/FilterBar';
import SkeletonLoader from '../components/SkeletonLoader';
import Toast from '../components/Toast';
import ConnectionIndicator from '../components/ConnectionIndicator';
import { subscribeToTasks, deleteTask as deleteTaskFirebase, updateTask } from '../services/tasks';
import * as Notifications from 'expo-notifications';
import { getCurrentSession } from '../services/authFirestore';

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [filters, setFilters] = useState({ searchText: '', area: '', responsible: '', priority: '', overdue: false });
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Animation
  const fadeAnim = useState(new Animated.Value(0))[0];


  // Cargar usuario actual
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const result = await getCurrentSession();
    if (result.success) {
      setCurrentUser(result.session);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Las tareas se actualizan automáticamente por el listener
    // Solo simulamos el tiempo de refresco
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Suscribirse a cambios en tiempo real de Firebase
  useEffect(() => {
    const unsubscribe = subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
      setIsLoading(false);
      
      // Animar entrada de la lista
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, [fadeAnim]);

  // Navegar a pantalla para crear nueva tarea (solo admin y jefe)
  const goToCreate = useCallback(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'jefe')) {
      navigation.navigate('TaskDetail');
    } else {
      Alert.alert('Sin permisos', 'Solo administradores y jefes pueden crear tareas');
    }
  }, [currentUser, navigation]);

  const openDetail = useCallback((task) => {
    navigation.navigate('TaskDetail', { task });
  }, [navigation]);

  const openChat = useCallback((task) => {
    navigation.navigate('TaskChat', { taskId: task.id, taskTitle: task.title });
  }, [navigation]);

  const deleteTask = useCallback(async (taskId) => {
    // Solo admin puede eliminar tareas
    if (!currentUser || currentUser.role !== 'admin') {
      Alert.alert('Sin permisos', 'Solo los administradores pueden eliminar tareas');
      return;
    }

    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTaskFirebase(taskId);
              
              // Mostrar toast de confirmación
              setToastMessage('Tarea eliminada exitosamente');
              setToastType('success');
              setToastVisible(true);
            } catch (error) {
              setToastMessage(`Error al eliminar: ${error.message}`);
              setToastType('error');
              setToastVisible(true);
            }
            // La actualización del estado se hace automáticamente por el listener
          }
        }
      ]
    );
  }, [currentUser]);

  const toggleComplete = useCallback(async (task) => {
    try {
      const newStatus = task.status === 'cerrada' ? 'pendiente' : 'cerrada';
      await updateTask(task.id, { status: newStatus });
      
      // Mostrar toast de confirmación
      setToastMessage(newStatus === 'cerrada' ? 'Tarea marcada como completada' : 'Tarea reabierta');
      setToastType('success');
      setToastVisible(true);
    } catch (error) {
      setToastMessage(`Error al actualizar: ${error.message}`);
      setToastType('error');
      setToastVisible(true);
    }
    // La actualización del estado se hace automáticamente por el listener
  }, []);

  // Aplicar filtros con memoización
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // NOTA: El filtrado por rol ya se hace en el servidor (tasks.js subscribeToTasks)
      // Aquí solo aplicamos filtros adicionales de búsqueda
      
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
  }, [tasks, filters]);

  // Estadísticas Bento con memoización
  const statistics = useMemo(() => {
    const todayTasks = filteredTasks.filter(t => {
      const today = new Date().setHours(0,0,0,0);
      const dueDate = t.dueAt ? new Date(t.dueAt).setHours(0,0,0,0) : null;
      return dueDate === today;
    });

    const highPriorityTasks = filteredTasks.filter(t => t.priority === 'alta' && t.status !== 'cerrada');
    const overdueTasks = filteredTasks.filter(t => t.dueAt && t.dueAt < Date.now() && t.status !== 'cerrada');
    const myTasks = filteredTasks.filter(t => t.assignedTo && t.status !== 'cerrada');
    
    const tasksByArea = filteredTasks.reduce((acc, task) => {
      const area = task.area || 'Sin área';
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});

    const topAreas = Object.entries(tasksByArea)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
      
    return {
      todayTasks,
      highPriorityTasks,
      overdueTasks,
      myTasks,
      topAreas
    };
  }, [filteredTasks]);

  const { todayTasks, highPriorityTasks, overdueTasks, myTasks, topAreas } = statistics;

  // Memoizar handler de filtros
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <View style={styles.container}>
      <ConnectionIndicator />
      
      <LinearGradient
        colors={['#8B0000', '#6B0000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <View style={styles.greetingContainer}>
              <Ionicons name="hand-right" size={20} color="#FFFFFF" style={{ marginRight: 8, opacity: 0.9 }} />
              <Text style={styles.greeting}>Hola!</Text>
            </View>
            <Text style={styles.heading}>Mis Tareas</Text>
          </View>
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'jefe') && (
            <TouchableOpacity style={styles.addButton} onPress={goToCreate}>
              <LinearGradient
                colors={['#FFFFFF', '#FFF8DC']}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={36} color="#DAA520" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filtros Rápidos con Chips */}
      <View style={styles.quickFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFiltersContent}>
          <TouchableOpacity 
            style={[styles.filterChip, !filters.searchText && !filters.area && !filters.priority && !filters.overdue && styles.filterChipActive]}
            onPress={() => setFilters({ searchText: '', area: '', responsible: '', priority: '', overdue: false })}
          >
            <Ionicons name="apps" size={16} color={!filters.searchText && !filters.area && !filters.priority && !filters.overdue ? "#FFFFFF" : "#8B0000"} />
            <Text style={[styles.filterChipText, !filters.searchText && !filters.area && !filters.priority && !filters.overdue && styles.filterChipTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, filters.overdue && styles.filterChipActive]}
            onPress={() => setFilters({ ...filters, overdue: !filters.overdue })}
          >
            <Ionicons name="time" size={16} color={filters.overdue ? "#FFFFFF" : "#8B0000"} />
            <Text style={[styles.filterChipText, filters.overdue && styles.filterChipTextActive]}>
              Vencidas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, filters.priority === 'alta' && styles.filterChipActive]}
            onPress={() => setFilters({ ...filters, priority: filters.priority === 'alta' ? '' : 'alta' })}
          >
            <Ionicons name="warning" size={16} color={filters.priority === 'alta' ? "#FFFFFF" : "#FF9500"} />
            <Text style={[styles.filterChipText, filters.priority === 'alta' && styles.filterChipTextActive]}>
              Urgente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip]}
            onPress={() => {
              const today = new Date();
              today.setHours(0,0,0,0);
              const todayStart = today.getTime();
              const todayEnd = todayStart + 24 * 3600 * 1000;
              setFilters({ ...filters, searchText: 'HOY_SPECIAL_FILTER' });
            }}
          >
            <Ionicons name="today" size={16} color="#34C759" />
            <Text style={styles.filterChipText}>
              Hoy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip]}
            onPress={() => {
              const weekEnd = new Date();
              weekEnd.setDate(weekEnd.getDate() + 7);
              setFilters({ ...filters, searchText: 'WEEK_SPECIAL_FILTER' });
            }}
          >
            <Ionicons name="calendar-outline" size={16} color="#5856D6" />
            <Text style={styles.filterChipText}>
              Esta semana
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FilterBar onFilterChange={handleFilterChange} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={filteredTasks}
          keyExtractor={(i) => i.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B0000"
              colors={['#8B0000']}
            />
          }
          contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          isLoading ? (
            <SkeletonLoader type="bento" />
          ) : (
          <View style={styles.bentoGrid}>
            {/* Fila 1: Bloque grande (Hoy) + Bloque mediano (Vencidas) */}
            <View style={styles.bentoRow}>
              <TouchableOpacity style={[styles.bentoCard, styles.bentoLarge]} activeOpacity={0.9}>
                <LinearGradient colors={['#FF9500', '#FF6B00']} style={styles.bentoGradient}>
                  <View style={styles.bentoIconCircle}>
                    <Ionicons name="calendar" size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.bentoContent}>
                    <Text style={styles.bentoTitleLarge}>Hoy</Text>
                    <Text style={styles.bentoNumberLarge}>{todayTasks.length}</Text>
                    <Text style={styles.bentoSubtext}>tareas para hoy</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.bentoCard, styles.bentoMedium]} activeOpacity={0.9}>
                <LinearGradient colors={['#8B0000', '#6B0000']} style={styles.bentoGradient}>
                  <View style={styles.bentoIconCircle}>
                    <Ionicons name="alert-circle" size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.bentoContent}>
                    <Text style={styles.bentoTitleSmall}>Vencidas</Text>
                    <Text style={styles.bentoNumberMedium}>{overdueTasks.length}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Fila 2: 3 bloques pequeños (Total, Prioritarias, Mis tareas) */}
            <View style={styles.bentoRow}>
              <TouchableOpacity style={[styles.bentoCard, styles.bentoSmall]} activeOpacity={0.9}>
                <LinearGradient colors={['#34C759', '#28A745']} style={styles.bentoGradientSmall}>
                  <View style={styles.bentoIconCircleSmall}>
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.bentoNumberSmall}>{filteredTasks.length}</Text>
                  <Text style={styles.bentoLabel}>Total</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.bentoCard, styles.bentoSmall]} activeOpacity={0.9}>
                <LinearGradient colors={['#DAA520', '#B8860B']} style={styles.bentoGradientSmall}>
                  <View style={styles.bentoIconCircleSmall}>
                    <Ionicons name="flame" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.bentoNumberSmall}>{highPriorityTasks.length}</Text>
                  <Text style={styles.bentoLabel}>Urgentes</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.bentoCard, styles.bentoSmall]} activeOpacity={0.9}>
                <LinearGradient colors={['#5856D6', '#4842C2']} style={styles.bentoGradientSmall}>
                  <View style={styles.bentoIconCircleSmall}>
                    <Ionicons name="person" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.bentoNumberSmall}>{myTasks.length}</Text>
                  <Text style={styles.bentoLabel}>Asignadas</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Fila 3: Bloque ancho para áreas principales */}
            <View style={styles.bentoRow}>
              <View style={[styles.bentoCard, styles.bentoWide]}>
                <View style={styles.bentoHeader}>
                  <Ionicons name="business" size={20} color="#1A1A1A" />
                  <Text style={[styles.bentoTitle, { color: '#1A1A1A' }]}>Áreas Principales</Text>
                </View>
                <View style={styles.areasContainer}>
                  {topAreas.map(([area, count], index) => (
                    <View key={area} style={styles.areaTag}>
                      <Text style={styles.areaName}>{area}</Text>
                      <View style={styles.areaBadge}>
                        <Text style={styles.areaCount}>{count}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Todas las Tareas</Text>
          </View>
          )
        }
        renderItem={({ item }) => (
          <TaskItem 
            task={item} 
            onPress={() => openDetail(item)}
            onDelete={() => deleteTask(item.id)}
            onToggleComplete={() => toggleComplete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color="#C7C7CC" style={{ marginBottom: 20 }} />
            <Text style={styles.emptyText}>Sin tareas pendientes</Text>
            <Text style={styles.emptySubtext}>Toca el botón + para crear una nueva tarea</Text>
          </View>
        }
      />
      </Animated.View>
      
      <Toast 
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA'
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 28
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    letterSpacing: 0.3
  },
  heading: { 
    fontSize: 42, 
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1.5
  },
  addButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12
  },
  addButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)'
  },
  listContent: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 100
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40
  },
  emptyText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: -0.8
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500'
  },
  // Bento Grid Styles
  bentoGrid: {
    gap: 14,
    marginBottom: 32
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14
  },
  bentoCard: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10
  },
  bentoLarge: {
    flex: 2,
    minHeight: 180
  },
  bentoMedium: {
    flex: 1,
    minHeight: 180
  },
  bentoSmall: {
    flex: 1,
    minHeight: 140
  },
  bentoWide: {
    flex: 1,
    backgroundColor: '#FFFAF0',
    borderWidth: 2.5,
    borderColor: '#F5DEB3',
    padding: 20,
    minHeight: 110
  },
  bentoGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start'
  },
  bentoGradientSmall: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  bentoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  bentoIconCircleSmall: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  bentoContent: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  bentoTitleLarge: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  bentoTitleSmall: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  bentoNumberLarge: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -3,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6
  },
  bentoNumberMedium: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2.5,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6
  },
  bentoNumberSmall: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6
  },
  bentoSubtext: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  bentoLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14
  },
  areaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    gap: 10,
    borderWidth: 2,
    borderColor: '#F5DEB3',
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  areaName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3
  },
  areaBadge: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center'
  },
  areaCount: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.8,
    marginBottom: 16,
    marginTop: 12
  },
  quickFilters: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA'
  },
  quickFiltersContent: {
    paddingRight: 20
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F5DEB3',
    marginRight: 10,
    gap: 8,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  filterChipActive: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ scale: 1.02 }]
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B0000',
    letterSpacing: 0.2
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  }
});
