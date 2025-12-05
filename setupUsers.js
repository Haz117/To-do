// setupUsers.js
// Script para generar datos de usuarios para Firebase Firestore
// Ejecuta: node setupUsers.js

const simpleHash = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

// DEFINE TUS USUARIOS AQUÍ - PERSONALIZA SEGÚN TUS NECESIDADES
const users = [
  // 1. Administrador (acceso total)
  {
    email: 'admin@todo.com',
    password: 'admin123',
    displayName: 'Administrador',
    role: 'admin',
    department: null // Admin no necesita department
  },
  
  // 2. Jefe de Jurídica (solo ve/edita tareas de jurídica)
  {
    email: 'jefe.juridica@todo.com',
    password: 'jefe123',
    displayName: 'Jefe Jurídica',
    role: 'jefe',
    department: 'juridica'
  },
  
  // 3. Jefe de Obras (solo ve/edita tareas de obras)
  {
    email: 'jefe.obras@todo.com',
    password: 'jefe123',
    displayName: 'Jefe Obras',
    role: 'jefe',
    department: 'obras'
  },
  
  // 4. Operativo de Jurídica (solo ve tareas asignadas a él)
  {
    email: 'operativo.juridica@todo.com',
    password: 'oper123',
    displayName: 'Juan Pérez',
    role: 'operativo',
    department: 'juridica'
  },
  
  // 5. Operativo de Obras (solo ve tareas asignadas a él)
  {
    email: 'operativo.obras@todo.com',
    password: 'oper123',
    displayName: 'María García',
    role: 'operativo',
    department: 'obras'
  }
];

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║       DATOS PARA FIREBASE FIRESTORE - COLLECTION: users  ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

users.forEach((user, index) => {
  const hashedPassword = simpleHash(user.password + user.email);
  
  console.log(`┌─────────────────────────────────────────────────────────┐`);
  console.log(`│ Usuario ${index + 1}: ${user.displayName.padEnd(43)}│`);
  console.log(`└─────────────────────────────────────────────────────────┘`);
  console.log('\n📋 DATOS PARA FIRESTORE (Document ID: auto-generado):\n');
  console.log(JSON.stringify({
    email: user.email,
    password: hashedPassword,
    displayName: user.displayName,
    role: user.role,
    department: user.department,
    active: true,
    createdAt: '(usar Server timestamp)'
  }, null, 2));
  
  console.log('\n🔑 CREDENCIALES DE LOGIN:');
  console.log(`   Email:    ${user.email}`);
  console.log(`   Password: ${user.password}`);
  console.log(`   Rol:      ${user.role}`);
  if (user.department) {
    console.log(`   Área:     ${user.department}`);
  }
  console.log('\n' + '─'.repeat(60) + '\n');
});

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                    INSTRUCCIONES                          ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');
console.log('1. Ve a: https://console.firebase.google.com/');
console.log('2. Selecciona proyecto: infra-sublime-464215-m5');
console.log('3. Ve a Firestore Database');
console.log('4. Si no existe, crea la colección "users"');
console.log('5. Para cada usuario arriba:');
console.log('   - Click en "Agregar documento"');
console.log('   - ID del documento: (dejar auto-generado)');
console.log('   - Agregar los campos manualmente:');
console.log('     * email (string)');
console.log('     * password (string) - usar el hash generado');
console.log('     * displayName (string)');
console.log('     * role (string)');
console.log('     * department (string o null)');
console.log('     * active (boolean) - true');
console.log('     * createdAt (timestamp) - usar fecha actual');
console.log('   - Click en "Guardar"\n');
console.log('⚠️  IMPORTANTE: Para createdAt usa el tipo "timestamp" y la fecha actual\n');
console.log('✅ Después podrás hacer login con las credenciales mostradas arriba\n');
