📝 To-Do Avanzado (Expo + Firebase)

Aplicación de gestión de tareas desarrollada con React Native, Expo y Firebase.

🚀 Características

✅ Crear, editar y eliminar tareas

📱 Compatible con iOS, Android y Web

🔔 Notificaciones push

💬 Chat por tarea

📊 Vista tipo Kanban

📥 Bandeja de entrada personal

☁️ Sincronización con Firebase

📋 Requisitos Previos

Node.js (v14 o superior)

npm o yarn

App Expo Go en tu dispositivo móvil (para pruebas)

Cuenta en Firebase

🔧 Configuración
1️⃣ Instalar dependencias
npm install --legacy-peer-deps

2️⃣ Configurar Firebase

Crea un proyecto en Firebase Console

Copia el archivo .env.example a .env:

copy .env.example .env


Completa tus credenciales en .env:

FIREBASE_API_KEY=tu_api_key_aqui
FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu_proyecto_id
FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id
FIREBASE_MEASUREMENT_ID=tu_measurement_id

3️⃣ Instalar versiones compatibles
npx expo install --fix

🏃 Ejecutar la App
🔹 Modo desarrollo
npm start


o

npx expo start

🔹 Opciones de ejecución

Android: Presiona a o ejecuta npm run android

iOS: Presiona i o ejecuta npm run ios

Web: Presiona w o ejecuta npm run web

Dispositivo físico: Escanea el código QR con Expo Go

📁 Estructura del Proyecto
TODO/
├── components/          # Componentes reutilizables
│   ├── FilterBar.js
│   └── TaskItem.js
├── screens/             # Pantallas principales
│   ├── HomeScreen.js
│   ├── KanbanScreen.js
│   ├── MyInboxScreen.js
│   ├── TaskChatScreen.js
│   └── TaskDetailScreen.js
├── services/            # Lógica y utilidades
│   ├── notifications.js
│   └── user.js
├── App.js               # Punto de entrada principal
├── firebase.js          # Configuración de Firebase
├── storage.js           # Manejo de almacenamiento local
└── app.config.js        # Configuración de Expo

🔥 Configurar Firestore

En Firebase Console, crea una colección llamada tasks con esta estructura:

{
  title: string,
  description: string,
  status: string,      // 'todo', 'in-progress', 'done'
  priority: string,    // 'low', 'medium', 'high'
  dueDate: timestamp,
  assignedTo: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

⚠️ Solución de Problemas
🧩 Versiones incompatibles
npx expo install --fix

🚫 Error de Metro Bundler
npx expo start -c

🗑️ Problemas con node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install --legacy-peer-deps

📄 Licencia

ISC License

👥 Autor

Tu nombre aquí

⚡ Instrucciones Rápidas

Crea un nuevo proyecto Expo:

npx create-expo-app MyTodoApp
cd MyTodoApp


Copia los archivos en la raíz del proyecto.

Instala las dependencias necesarias:

npm install firebase @react-navigation/native @react-navigation/stack @react-native-async-storage/async-storage
expo install expo-notifications react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context


Agrega tu configuración de Firebase en firebase.js.

Ejecuta la app:

npx expo start

🔐 Variables de Entorno

He creado un archivo .env con tus credenciales.

Recomendaciones:

Añade .env a tu .gitignore para no subirlo al repositorio.

Para que Expo inyecte las variables en tiempo de ejecución, app.config.js usa dotenv.

Instala dotenv como dependencia de desarrollo:

npm install dotenv --save-dev


firebase.js lee la configuración desde Constants.manifest.extra (inyectado por Expo) o process.env como respaldo.

🔒 Seguridad

Estas claves permiten acceder a tu proyecto Firebase.
Evita compartir el archivo .env en público.
Para producción, usa secrets del servidor o mecanismos seguros de configuración.git pus