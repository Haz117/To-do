// createAdminUser.js
// Script para crear el primer usuario administrador
// Uso: node createAdminUser.js

const simpleHash = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

// Datos del admin
const email = 'admin@todo.com';
const password = 'admin123'; // CAMBIAR ESTO
const displayName = 'Administrador';

const hashedPassword = simpleHash(password + email);

console.log('\n=== DATOS PARA CREAR USUARIO ADMIN EN FIRESTORE ===\n');
console.log('Copia estos datos en Firebase Console:');
console.log('\nCollection: users');
console.log('Document ID: (auto-generado)');
console.log('\nCampos:');
console.log(JSON.stringify({
  email: email,
  password: hashedPassword,
  displayName: displayName,
  role: 'admin',
  active: true,
  createdAt: '(usar Timestamp actual)'
}, null, 2));

console.log('\n=== CREDENCIALES DE LOGIN ===');
console.log('Email:', email);
console.log('Password:', password);
console.log('\n¡IMPORTANTE! Cambia la contraseña después del primer login.\n');
