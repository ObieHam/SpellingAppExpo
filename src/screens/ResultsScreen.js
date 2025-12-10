import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import WordItem from '../components/WordItem';

export default function ResultsScreen({ navigation, route }) {
  const { correct, incorrect, missedWords } = route.params;
  const total = correct + incorrect;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const handlePracticeMissed = () => {
    if (missedWords.length === 0) {
      navigation.navigate('Home');
      return;
    }
    navigation.replace('Practice', { type: 'missed', words: missedWords });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Practice Complete! 🎉</Text>

      <View style={styles.statsContainer}>
        <StatCard
          number={correct}
          label="Correct"
          color="#28a745"
        />
        <StatCard
          number={incorrect}
          label="Incorrect"
          color="#dc3545"
        />
      </View>

      <View style={styles.accuracyCard}>
        <Text style={styles.accuracyNumber}>{accuracy}%</Text>
        <Text style={styles.accuracyLabel}>Accuracy</Text>
      </View>

      {missedWords.length > 0 && (
        <View style={styles.missedContainer}>
          <Text style={styles.missedTitle}>Words to Review:</Text>
          <View style={styles.wordList}>
            {missedWords.map((word, index) => (
              <WordItem key={index} word={word} />
            ))}
          </View>
        </View>
      )}

      <View style={styles.buttonGroup}>
        <Button
          title="Home"
          icon="🏠"
          onPress={() => navigation.navigate('Home')}
        />
        {missedWords.length > 0 && (
          <Button
            title="Practice Missed Words"
            icon="🔁"
            variant="success"
            onPress={handlePracticeMissed}
          />
        )}
      </View>

      {correct === total && total > 0 && (
        <View style={styles.perfectScore}>
          <Text style={styles.perfectText}>Perfect Score! 🌟</Text>
          <Text style={styles.perfectSubtext}>Amazing work! You got everything right!</Text>
        </View>
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  accuracyCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  accuracyNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
  },
  accuracyLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  missedContainer: {
    marginBottom: 20,
  },
  missedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  wordList: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  buttonGroup: {
    marginTop: 10,
  },
  perfectScore: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#d4edda',
    borderRadius: 12,
    alignItems: 'center',
  },
  perfectText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#155724',
  },
  perfectSubtext: {
    fontSize: 14,
    color: '#155724',
    marginTop: 5,
  },
});