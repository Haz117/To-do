// screens/KanbanScreen.js
// Tablero Kanban con columnas por estado. Implementa Drag & Drop para cambiar estado de tareas.
// Estados: pendiente, en_proceso, en_revision, cerrada
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import FilterBar from '../components/FilterBar';
import { subscribeToTasks, updateTask } from '../services/tasks';

const STATUSES = [
  { key: 'pendiente', label: 'Pendiente', color: '#FF9800', icon: 'hourglass-outline' },
  { key: 'en_proceso', label: 'En proceso', color: '#2196F3', icon: 'play-circle-outline' },
  { key: 'en_revision', label: 'En revisión', color: '#9C27B0', icon: 'eye-outline' },
  { key: 'cerrada', label: 'Cerrada', color: '#4CAF50', icon: 'checkmark-circle-outline' }
];

export default function KanbanScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ searchText: '', area: '', responsible: '', priority: '', overdue: false });
  const [refreshing, setRefreshing] = useState(false);
  const [draggingTask, setDraggingTask] = useState(null);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const changeStatus = useCallback(async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
    // La actualización del estado se hace automáticamente por el listener
  }, []);

  const openDetail = useCallback((task) => navigation.navigate('TaskDetail', { task }), [navigation]);

  // Función para detectar en qué columna se soltó la tarjeta
  const getColumnAtPosition = (x) => {
    // Aproximación: cada columna tiene 300px de ancho + 16px de margen
    const columnWidth = 316;
    const columnIndex = Math.floor((x + 16) / columnWidth);
    if (columnIndex >= 0 && columnIndex < STATUSES.length) {
      return STATUSES[columnIndex].key;
    }
    return null;
  };

  const handleDragEnd = (task, event) => {
    const { absoluteX } = event.nativeEvent;
    const targetStatus = getColumnAtPosition(absoluteX);
    
    if (targetStatus && targetStatus !== task.status) {
      changeStatus(task.id, targetStatus);
    }
    
    setDraggingTask(null);
  };

  // Componente de tarjeta arrastrable
  const DraggableCard = ({ item, status }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      zIndex: draggingTask?.id === item.id ? 1000 : 1,
    }));

    const onGestureEvent = useCallback((event) => {
      const { translationX, translationY, state } = event.nativeEvent;

      if (state === State.ACTIVE) {
        translateX.value = translationX;
        translateY.value = translationY;
        scale.value = withSpring(1.05);
        runOnJS(setDraggingTask)(item);
      } else if (state === State.END || state === State.CANCELLED) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        runOnJS(handleDragEnd)(item, event);
      }
    }, [item]);

    return (
      <PanGestureHandler onHandlerStateChange={onGestureEvent} onGestureEvent={onGestureEvent}>
        <Animated.View style={[animatedStyle]}>
          <TouchableOpacity
            onPress={() => openDetail(item)}
            style={[
              styles.card,
              draggingTask?.id === item.id && styles.cardDragging
            ]}
            activeOpacity={0.9}
          >
            <View style={styles.cardPriorityIndicator}>
              <View style={[
                styles.priorityDot,
                item.priority === 'alta' && styles.priorityDotHigh,
                item.priority === 'media' && styles.priorityDotMedium,
                item.priority === 'baja' && styles.priorityDotLow
              ]} />
            </View>
            
            {/* Icono de drag */}
            <View style={styles.dragHandle}>
              <Ionicons name="reorder-two" size={20} color="#C7C7CC" />
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.cardMetaRow}>
              <Ionicons name="person-outline" size={14} color="#8E8E93" />
              <Text style={styles.cardMeta}>{item.assignedTo || 'Sin asignar'}</Text>
            </View>
            <View style={styles.cardMetaRow}>
              <Ionicons name="calendar-outline" size={14} color="#8E8E93" />
              <Text style={styles.cardDue}>{new Date(item.dueAt).toLocaleDateString()}</Text>
            </View>

            {/* Botones rápidos para cambiar estado (respaldo) */}
            <View style={styles.actionsRow}>
              {STATUSES.filter(s => s.key !== status.key).slice(0, 2).map(s => (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => changeStatus(item.id, s.key)}
                  style={[styles.miniBtn, { borderColor: s.color }]}
                >
                  <Ionicons name={s.icon} size={14} color={s.color} />
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  // Aplicar filtros con memoización
  const applyFilters = useCallback((taskList) => {
    return taskList.filter(task => {
      if (filters.searchText && !task.title.toLowerCase().includes(filters.searchText.toLowerCase())) return false;
      if (filters.area && task.area !== filters.area) return false;
      if (filters.responsible && task.assignedTo !== filters.responsible) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.overdue && task.dueAt >= Date.now()) return false;
      return true;
    });
  }, [filters]);

  const renderColumn = (status) => {
    const byStatus = tasks.filter(t => (t.status || 'pendiente') === status.key);
    const filtered = applyFilters(byStatus);

    return (
      <View key={status.key} style={styles.column}>
        <View style={[styles.columnHeader, { backgroundColor: status.color + '15' }]}>
          <View style={styles.columnTitleContainer}>
            <Ionicons name={status.icon} size={20} color={status.color} style={{ marginRight: 8 }} />
            <Text style={[styles.columnTitle, { color: status.color }]}>{status.label}</Text>
          </View>
          <View style={[styles.columnCount, { backgroundColor: status.color }]}>
            <Text style={styles.columnCountText}>{filtered.length}</Text>
          </View>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DraggableCard item={item} status={status} />}
          contentContainerStyle={{ paddingBottom: 12 }}
        />
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <LinearGradient colors={['#8B0000', '#6B0000']} style={styles.headerGradient}>
          <View style={styles.header}>
            <View>
              <View style={styles.greetingContainer}>
                <Ionicons name="grid" size={20} color="#FFFFFF" style={{ marginRight: 8, opacity: 0.9 }} />
                <Text style={styles.greeting}>Vista de tablero</Text>
              </View>
              <Text style={styles.heading}>Kanban</Text>
            </View>
          </View>
        </LinearGradient>
        <FilterBar onFilterChange={setFilters} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.board}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B0000"
              colors={['#8B0000']}
            />
          }
        >
          {STATUSES.map(renderColumn)}
        </ScrollView>
        
        {/* Indicador visual de drag en proceso */}
        {draggingTask && (
          <View style={styles.dragIndicator}>
            <Ionicons name="move" size={20} color="#8B0000" />
            <Text style={styles.dragIndicatorText}>
              Arrastra a una columna para cambiar estado
            </Text>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
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
  board: { paddingHorizontal: 16, paddingVertical: 20 },
  column: { 
    width: 300, 
    marginHorizontal: 8, 
    backgroundColor: '#FFFAF0', 
    borderRadius: 16, 
    overflow: 'hidden',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#F5DEB3'
  },
  columnHeader: { 
    padding: 18, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  columnTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  columnTitle: { 
    fontWeight: '800', 
    fontSize: 17,
    letterSpacing: 0.2,
    flex: 1
  },
  columnCount: { 
    fontSize: 14, 
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    minWidth: 32
  },
  columnCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center'
  },
  card: { 
    margin: 10, 
    padding: 12, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  cardDragging: {
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderColor: '#8B0000',
    borderWidth: 2,
    backgroundColor: '#FFFBF5'
  },
  dragHandle: {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: 4
  },
  cardPriorityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C7C7CC'
  },
  priorityDotHigh: {
    backgroundColor: '#8B0000'
  },
  priorityDotMedium: {
    backgroundColor: '#DAA520'
  },
  priorityDotLow: {
    backgroundColor: '#4CAF50'
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    marginBottom: 10, 
    color: '#1A1A1A',
    letterSpacing: -0.2,
    paddingRight: 24,
    lineHeight: 22
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8
  },
  cardMeta: { 
    fontSize: 14, 
    color: '#1A1A1A', 
    fontWeight: '600',
    flex: 1
  },
  cardDue: { 
    fontSize: 13, 
    color: '#6E6E73',
    fontWeight: '600'
  },
  actionsRow: { 
    flexDirection: 'row', 
    marginTop: 12, 
    gap: 8
  },
  miniBtn: { 
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dragIndicator: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: '#FFFAF0',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#8B0000'
  },
  dragIndicatorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B0000',
    letterSpacing: 0.3
  }
});
