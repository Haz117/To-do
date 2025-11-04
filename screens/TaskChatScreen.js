// screens/TaskChatScreen.js
// Chat simple por tarea usando Firestore. Colección: tasks/{taskId}/messages
// Requiere que configures firebase.js con tu proyecto.
// Funcionalidad mínima: lista de mensajes en tiempo real + enviar mensaje de texto.

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, getServerTimestamp } from '../firebase';

export default function TaskChatScreen({ route }) {
  const { taskId, taskTitle } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const flatRef = useRef();

  useEffect(() => {
    // Listener en tiempo real de la colección de mensajes de la tarea
    const q = query(collection(db, 'tasks', taskId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      setMessages(arr);
    }, (err) => console.warn('Error listener chat', err));

    return () => unsub();
  }, [taskId]);

  const send = async () => {
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, 'tasks', taskId, 'messages'), {
        text: text.trim(),
        author: 'Anon', // aquí podrías poner el usuario real
        createdAt: getServerTimestamp()
      });
      setText('');
      // scroll opcional
      setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 200);
    } catch (e) {
      console.warn('Error enviando mensaje', e);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ios:'padding', android:undefined})}>
      <View style={styles.header}>
        <Text style={styles.title}>{taskTitle || 'Chat'}</Text>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item }) => (
          <View style={styles.msgRow}>
            <Text style={styles.msgAuthor}>{item.author}</Text>
            <Text style={styles.msgText}>{item.text}</Text>
            <Text style={styles.msgTime}>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : ''}</Text>
          </View>
        )}
      />

      <View style={styles.composer}>
        <TextInput
          placeholder="Mensaje..."
          placeholderTextColor="#C7C7CC"
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={send}>
          <Text style={styles.sendButtonText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  header: { 
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 16,
    backgroundColor: '#FAFAFA'
  },
  title: { 
    fontSize: 38, 
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -1
  },
  messagesContainer: {
    padding: 20
  },
  msgRow: { 
    marginBottom: 16, 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 20,
    maxWidth: '85%',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  msgAuthor: { 
    fontWeight: '700', 
    marginBottom: 6, 
    color: '#007AFF',
    fontSize: 14,
    letterSpacing: 0.2
  },
  msgText: { 
    color: '#1A1A1A',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400'
  },
  msgTime: { 
    marginTop: 8, 
    fontSize: 12, 
    color: '#AEAEB2',
    fontWeight: '500'
  },
  composer: { 
    flexDirection: 'row', 
    padding: 16, 
    alignItems: 'center', 
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E5E5EA',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8
  },
  input: { 
    flex: 1, 
    padding: 12, 
    backgroundColor: '#F2F2F7', 
    borderRadius: 24,
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '400'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700'
  }
});
