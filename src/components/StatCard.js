import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatCard({ number, label, color = '#667eea' }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.number, { color }]}>{number}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  number: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});