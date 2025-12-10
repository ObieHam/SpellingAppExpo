import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function WordItem({ word, onDelete, showDelete = false }) {
  return (
    <View style={styles.container}>
      <Text style={styles.word}>{word}</Text>
      {showDelete && (
        <TouchableOpacity onPress={() => onDelete(word)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  word: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    fontSize: 18,
    color: '#dc3545',
  },
});