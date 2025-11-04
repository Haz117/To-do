// App.js
// Punto de entrada: configura Navigation, expo-notifications y permisos básicos.
// Incluye Stack con Home, TaskDetail, TaskChat.

// IMPORTANTE: Este import debe estar PRIMERO antes de cualquier otro
import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './screens/HomeScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';
import TaskChatScreen from './screens/TaskChatScreen';
import MyInboxScreen from './screens/MyInboxScreen';
import KanbanScreen from './screens/KanbanScreen';
import ReportScreen from './screens/ReportScreen';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert } from 'react-native';

// Configuración del handler de notificaciones (mostrar aun si app en foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    (async () => {
      // Pedir permiso para notificaciones
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          Alert.alert('Permisos de notificación denegados', 'Activa las notificaciones para recibir recordatorios.');
        }
      } else {
        console.warn('Se recomienda probar notificaciones en un dispositivo físico.');
      }
    })();

    // Listener opcional para manejar interacción con notificación
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      // Aquí podríamos navegar a la tarea leyendo response.notification.request.content.data
      console.log('Interacted notification', response);
    });

    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#FAFAFA' }
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="TaskChat" component={TaskChatScreen} />
          <Stack.Screen name="MyInbox" component={MyInboxScreen} />
          <Stack.Screen name="Kanban" component={KanbanScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
