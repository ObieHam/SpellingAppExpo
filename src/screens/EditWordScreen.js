import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '../components/Button';
import { StorageService } from '../services/storage';
import { SpeechService } from '../services/speech';

export default function EditWordScreen({ navigation, route }) {
  const { word } = route.params;
  const [exampleSentence, setExampleSentence] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWordData();
  }, []);

  const loadWordData = async () => {
    const data = await StorageService.loadData();
    if (data.wordHistory[word]?.exampleSentence) {
      setExampleSentence(data.wordHistory[word].exampleSentence);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const data = await StorageService.loadData();
    
    if (!data.wordHistory[word]) {
      data.wordHistory[word] = { correct: 0, incorrect: 0, mistakes: [], exampleSentence: '' };
    }
    
    data.wordHistory[word].exampleSentence = exampleSentence.trim();
    await StorageService.saveData(data);
    
    Alert.alert('Saved!', 'Example sentence has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handlePlayWord = () => {
    SpeechService.speakWord(word);
  };

  const handlePlayExample = () => {
    if (exampleSentence.trim()) {
      SpeechService.speakWord(exampleSentence);
    } else {
      Alert.alert('No Example', 'Please enter an example sentence first.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.wordCard}>
          <Text style={styles.wordLabel}>Word:</Text>
          <View style={styles.wordRow}>
            <Text style={styles.wordText}>{word}</Text>
            <Button
              title="🔊"
              onPress={handlePlayWord}
              style={styles.playButton}
            />
          </View>
        </View>

        <Text style={styles.label}>Example Sentence:</Text>
        <Text style={styles.helpText}>
          Add a sentence using this word to help remember it better.
        </Text>
        
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          placeholder={`For example: "The ${word} was clearly visible."`}
          value={exampleSentence}
          onChangeText={setExampleSentence}
          autoCapitalize="sentences"
          autoCorrect={true}
        />

        {exampleSentence.trim() && (
          <Button
            title="🔊 Play Example Sentence"
            onPress={handlePlayExample}
            variant="secondary"
            style={styles.playExampleButton}
          />
        )}
        
        <View style={styles.buttonGroup}>
          <Button
            title="Save"
            icon="✅"
            variant="success"
            onPress={handleSave}
          />
          <Button
            title="Cancel"
            icon="←"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  wordCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wordLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  playButton: {
    minWidth: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  playExampleButton: {
    marginBottom: 10,
  },
  buttonGroup: {
    marginTop: 20,
  },
});