# 🎯 Drag & Drop en Kanban

## 📋 Descripción
Se ha implementado funcionalidad completa de **Drag & Drop** en el tablero Kanban para mover tareas entre columnas de estado de forma intuitiva y visual.

## ✨ Características Implementadas

### 1. **Drag & Drop Nativo**
- Arrastra tarjetas entre columnas para cambiar su estado
- Animaciones suaves con `react-native-reanimated`
- Feedback visual durante el arrastre (escala 1.05x, sombra roja)
- Indicador flotante que aparece al arrastrar

### 2. **Estados Soportados**
- 🟠 **Pendiente** → Tareas sin iniciar
- 🔵 **En proceso** → Tareas en desarrollo
- 🟣 **En revisión** → Tareas esperando aprobación
- 🟢 **Cerrada** → Tareas completadas

### 3. **Gestos Implementados**
- **Mantener presionado + Arrastrar** → Mueve la tarjeta
- **Soltar sobre columna** → Cambia estado automáticamente
- **Tap simple** → Abre detalles de la tarea
- **Botones rápidos** → Método alternativo para cambiar estado

## 🔧 Componentes Técnicos

### Dependencias Instaladas
```json
{
  "react-native-reanimated": "~4.0.0",
  "react-native-gesture-handler": "~2.28.0"
}
```

### Configuración Babel
```javascript
// babel.config.js
plugins: ['react-native-reanimated/plugin']
```

### Componente DraggableCard
- Usa `PanGestureHandler` para detectar gestos
- `useSharedValue` para valores animados (translateX, translateY, scale)
- `useAnimatedStyle` para estilos reactivos
- `runOnJS` para ejecutar funciones JS desde worklet

## 🎨 Feedback Visual

### Durante el Drag
- **Escala**: 1.0 → 1.05 (efecto de levantamiento)
- **Sombra**: Color rojo con blur 16px
- **Borde**: 2px rojo (#8B0000)
- **Fondo**: Cambia a #FFFBF5 (crema claro)
- **Z-Index**: 1000 (se superpone a otras tarjetas)

### Indicador Flotante
```
┌─────────────────────────────────────┐
│  🔄  Arrastra a una columna para    │
│      cambiar estado                 │
└─────────────────────────────────────┘
```

### Icono de Drag Handle
- Ubicado en esquina superior izquierda
- Icono `reorder-two` de Ionicons
- Color gris (#C7C7CC)

## 🚀 Cómo Usar

### Método 1: Drag & Drop
1. Mantén presionada una tarjeta en cualquier columna
2. Arrastra horizontalmente hacia la columna deseada
3. Suelta para confirmar el cambio de estado
4. La tarjeta se actualizará automáticamente en Firebase

### Método 2: Botones Rápidos (Respaldo)
1. Cada tarjeta muestra 2 botones circulares en la parte inferior
2. Representan los 2 estados más cercanos disponibles
3. Tap en el botón para cambiar estado instantáneamente

## 📐 Cálculo de Posición

### Detección de Columna
```javascript
const getColumnAtPosition = (x) => {
  const columnWidth = 316; // 300px ancho + 16px margen
  const columnIndex = Math.floor((x + 16) / columnWidth);
  return STATUSES[columnIndex]?.key || null;
};
```

### Actualización de Estado
```javascript
const handleDragEnd = (task, event) => {
  const { absoluteX } = event.nativeEvent;
  const targetStatus = getColumnAtPosition(absoluteX);
  
  if (targetStatus && targetStatus !== task.status) {
    changeStatus(task.id, targetStatus);
  }
  
  setDraggingTask(null);
};
```

## ⚙️ Requisitos para Dev Build

### ⚠️ IMPORTANTE
Esta funcionalidad requiere **Expo Dev Client** en lugar de **Expo Go** debido a:
- `react-native-reanimated` usa código nativo
- Babel plugin requiere rebuild del bundle
- Gestos nativos necesitan módulos nativos compilados

### Crear Dev Build

#### Para Android
```bash
npx expo install expo-dev-client
npx expo run:android
```

#### Para iOS
```bash
npx expo install expo-dev-client
npx expo run:ios
```

### Alternativa: EAS Build
```bash
npm install -g eas-cli
eas login
eas build --profile development --platform android
```

## 🔄 Sincronización Firebase

- **Optimista**: UI se actualiza inmediatamente
- **Real-time**: Firebase listener sincroniza automáticamente
- **Rollback**: Si falla la actualización, listener restaura estado previo
- **Multi-usuario**: Cambios de otros usuarios aparecen en tiempo real

## 🐛 Troubleshooting

### Error: "Reanimated 2 failed to create a worklet"
**Solución**: 
```bash
# Limpiar caché y reinstalar
rm -rf node_modules
npm install
npx expo start -c
```

### Error: "Cannot find module 'react-native-reanimated'"
**Solución**: Necesitas crear un dev build, Expo Go no soporta esta librería.

### Drag no responde
**Solución**: Verifica que `GestureHandlerRootView` envuelva el componente raíz.

## 📊 Rendimiento

### Optimizaciones Implementadas
- `useCallback` en handlers de gestos
- `useMemo` en cálculos de filtros (heredado de versión anterior)
- Animaciones nativas con `worklet` (no pasan por el JS bridge)
- FlatList virtualizado para listas largas

### Métricas Esperadas
- **Inicio de drag**: <16ms (60fps)
- **Animación de escala**: Smooth spring animation
- **Actualización Firebase**: <500ms (depende de red)
- **Re-render**: Solo columna afectada

## 🎓 Buenas Prácticas

### 1. Accesibilidad
- Mantener botones rápidos como método alternativo
- Indicador visual claro durante drag
- Feedback háptico (puede agregarse con `Haptics.impactAsync()`)

### 2. UX
- Animaciones suaves con `withSpring` (más natural que `withTiming`)
- Escala sutil (1.05x) para no obstruir vista
- Indicador flotante solo visible durante drag

### 3. Código
- Separar lógica de drag en componente `DraggableCard`
- Usar `runOnJS` para state updates desde worklet
- Cleanup en `handleDragEnd` (resetear `draggingTask`)

## 📚 Referencias

- [React Native Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Gesture Handler Docs](https://docs.swmansion.com/react-native-gesture-handler/)
- [Expo Dev Client](https://docs.expo.dev/develop/development-builds/introduction/)

## ✅ Checklist de Testing

- [ ] Drag & Drop funciona entre todas las columnas
- [ ] Animaciones son suaves (60fps)
- [ ] Firebase actualiza correctamente
- [ ] Indicador flotante aparece/desaparece correctamente
- [ ] Botones rápidos siguen funcionando (método alternativo)
- [ ] No hay conflictos con scroll horizontal
- [ ] Multi-touch no causa bugs
- [ ] Funciona con filtros activos

---

**Última actualización**: Noviembre 28, 2025
**Versión**: 1.0.0
**Autor**: GitHub Copilot
