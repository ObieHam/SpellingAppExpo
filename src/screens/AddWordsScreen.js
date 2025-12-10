import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../components/Button';

export default function AddWordsScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.subtitle}>Choose how you'd like to add words:</Text>
      
      <View style={styles.buttonGroup}>
        <Button
          title="Add Manually"
          icon="✏️"
          onPress={() => navigation.navigate('ManualAdd')}
        />
        <Button
          title="Upload CSV File"
          icon="📄"
          onPress={() => navigation.navigate('CsvUpload')}
        />
        <Button
          title="Back to Home"
          icon="🏠"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  contentContainer: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonGroup: {
    marginTop: 10,
  },
});