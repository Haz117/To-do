// App.js
// Punto de entrada: configura Navigation con Bottom Tabs, expo-notifications y permisos básicos.
// Navegación principal por pestañas + Stack para modales (TaskDetail, TaskChat)

// IMPORTANTE: Este import debe estar PRIMERO antes de cualquier otro
import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';
import TaskChatScreen from './screens/TaskChatScreen';
import MyInboxScreen from './screens/MyInboxScreen';
import KanbanScreen from './screens/KanbanScreen';
import ReportScreen from './screens/ReportScreen';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configuración del handler de notificaciones (mostrar aun si app en foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();

// Componente de navegación por tabs personalizado
function CustomTabBar({ activeTab, setActiveTab }) {
  const tabs = [
    { name: 'Tareas', icon: '📋', screen: 'Home' },
    { name: 'Kanban', icon: '📊', screen: 'Kanban' },
    { name: 'Mi Bandeja', icon: '📥', screen: 'MyInbox' },
    { name: 'Reportes', icon: '📈', screen: 'Report' }
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.screen}
          style={styles.tabItem}
          onPress={() => setActiveTab(tab.screen)}
        >
          <Text style={[
            styles.tabIcon,
            activeTab === tab.screen && styles.tabIconActive
          ]}>
            {tab.icon}
          </Text>
          <Text style={[
            styles.tabLabel,
            activeTab === tab.screen && styles.tabLabelActive
          ]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Navegador principal
function MainNavigator({ navigation }) {
  const [activeTab, setActiveTab] = useState('Home');

  const renderScreen = () => {
    const screenProps = { navigation };
    
    switch (activeTab) {
      case 'Home':
        return <HomeScreen {...screenProps} />;
      case 'Kanban':
        return <KanbanScreen {...screenProps} />;
      case 'MyInbox':
        return <MyInboxScreen {...screenProps} />;
      case 'Report':
        return <ReportScreen {...screenProps} />;
      default:
        return <HomeScreen {...screenProps} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
      <CustomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    (async () => {
      // Pedir permiso para notificaciones (solo funciona en development build, no en Expo Go)
      if (Device.isDevice) {
        try {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== 'granted') {
            console.log('Permisos de notificación denegados');
          }
        } catch (error) {
          // Silenciar error en Expo Go donde push notifications no están disponibles
          console.log('Notificaciones no disponibles en Expo Go');
        }
      }
    })();

    // Listener opcional para manejar interacción con notificación
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Interacted notification', response);
    });

    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_bottom',
            presentation: 'modal',
            contentStyle: { backgroundColor: '#FAFAFA' }
          }}
        >
          <Stack.Screen 
            name="MainTabs" 
            component={MainNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="TaskDetail" 
            component={TaskDetailScreen}
            options={{ 
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
          <Stack.Screen 
            name="TaskChat" 
            component={TaskChatScreen}
            options={{ 
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    height: 88,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6
  },
  tabIconActive: {
    fontSize: 28,
    opacity: 1
  },
  tabLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: 0.3
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '700'
  }
});
