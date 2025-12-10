import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import { StorageService } from '../services/storage';

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalWords: 0,
    misspelledCount: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    const data = await StorageService.loadData();
    setStats({
      totalWords: data.allWords?.length || 0,
      misspelledCount: data.misspelledWords?.length || 0,
    });
  };

  const handlePracticeAll = async () => {
    const data = await StorageService.loadData();
    if (data.allWords.length === 0) {
      Alert.alert('No Words', 'Please add some words first!');
      return;
    }
    navigation.navigate('Practice', { type: 'all', words: data.allWords });
  };

  const handlePracticeMisspelled = async () => {
    const data = await StorageService.loadData();
    if (data.misspelledWords.length === 0) {
      Alert.alert('No Misspelled Words', 'Complete a practice session first!');
      return;
    }
    navigation.navigate('Practice', { type: 'misspelled', words: data.misspelledWords });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Welcome to Spelling Trainer! 📚</Text>
      
      <View style={styles.buttonGroup}>
        <Button
          title="Add Words"
          icon="➕"
          onPress={() => navigation.navigate('AddWords')}
        />
        <Button
          title="Practice All Words"
          icon="✏️"
          onPress={handlePracticeAll}
        />
        <Button
          title="Practice Misspelled Words"
          icon="🔁"
          variant="secondary"
          onPress={handlePracticeMisspelled}
        />
        <Button
          title="View Word History"
          icon="📊"
          variant="secondary"
          onPress={() => navigation.navigate('WordHistory')}
        />
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          number={stats.totalWords}
          label="Total Words"
          color="#667eea"
        />
        <StatCard
          number={stats.misspelledCount}
          label="Misspelled Words"
          color="#dc3545"
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonGroup: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});