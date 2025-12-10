import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import Button from '../components/Button';
import { StorageService } from '../services/storage';
import { SpeechService } from '../services/speech';

export default function ManualAddScreen({ navigation }) {
  const [mode, setMode] = useState('choice'); // 'choice', 'single', 'bulk'
  
  // Single word mode
  const [singleWord, setSingleWord] = useState('');
  const [singleExample, setSingleExample] = useState('');
  
  // Bulk mode
  const [bulkText, setBulkText] = useState('');

  const handleSingleWordAdd = async () => {
    if (!singleWord.trim()) {
      Alert.alert('No Word', 'Please enter a word!');
      return;
    }

    const word = singleWord.trim().toLowerCase();
    const data = await StorageService.loadData();

    if (!data.allWords.includes(word)) {
      data.allWords.push(word);
    }
    
    if (!data.wordHistory[word]) {
      data.wordHistory[word] = { 
        correct: 0, 
        incorrect: 0, 
        mistakes: [],
        exampleSentence: singleExample.trim() 
      };
    } else {
      // Update example if word already exists
      if (singleExample.trim()) {
        data.wordHistory[word].exampleSentence = singleExample.trim();
      }
    }

    await StorageService.saveData(data);
    
    Alert.alert(
      'Success!',
      `Added "${word}"!`,
      [
        {
          text: 'Add Another',
          onPress: () => {
            setSingleWord('');
            setSingleExample('');
          },
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleBulkAdd = async () => {
    if (!bulkText.trim()) {
      Alert.alert('No Words', 'Please enter at least one word!');
      return;
    }

    const words = bulkText
      .split('\n')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0);

    if (words.length === 0) {
      Alert.alert('No Words', 'Please enter at least one valid word!');
      return;
    }

    const data = await StorageService.loadData();
    let addedCount = 0;

    words.forEach((word) => {
      if (!data.allWords.includes(word)) {
        data.allWords.push(word);
        addedCount++;
      }
      
      if (!data.wordHistory[word]) {
        data.wordHistory[word] = { 
          correct: 0, 
          incorrect: 0, 
          mistakes: [],
          exampleSentence: '' 
        };
      }
    });

    await StorageService.saveData(data);
    
    Alert.alert(
      'Success!',
      `Added ${addedCount} new word(s)!`,
      [
        {
          text: 'Add More',
          onPress: () => {
            setBulkText('');
          },
        },
        {
          text: 'Start Practice',
          onPress: () => navigation.navigate('Practice', { type: 'all', words: data.allWords }),
        },
      ]
    );
  };

  const handlePlayWord = () => {
    if (singleWord.trim()) {
      SpeechService.speakWord(singleWord);
    } else {
      Alert.alert('No Word', 'Please enter a word first.');
    }
  };

  const handlePlayExample = () => {
    if (singleExample.trim()) {
      SpeechService.speakWord(singleExample);
    } else {
      Alert.alert('No Example', 'Please enter an example sentence first.');
    }
  };

  // Choice Screen
  if (mode === 'choice') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.choiceTitle}>How would you like to add words?</Text>
          
          <TouchableOpacity 
            style={styles.choiceCard}
            onPress={() => setMode('single')}
          >
            <Text style={styles.choiceIcon}>📝</Text>
            <Text style={styles.choiceCardTitle}>Add Single Word</Text>
            <Text style={styles.choiceCardDesc}>Add one word at a time with an example sentence</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.choiceCard}
            onPress={() => setMode('bulk')}
          >
            <Text style={styles.choiceIcon}>📋</Text>
            <Text style={styles.choiceCardTitle}>Add Multiple Words</Text>
            <Text style={styles.choiceCardDesc}>Add many words at once (one per line)</Text>
          </TouchableOpacity>

          <Button
            title="Back"
            icon="←"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </ScrollView>
      </View>
    );
  }

  // Single Word Mode
  if (mode === 'single') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.wordCard}>
            <Text style={styles.label}>Word:</Text>
            <View style={styles.wordInputRow}>
              <TextInput
                style={styles.singleWordInput}
                value={singleWord}
                onChangeText={setSingleWord}
                placeholder="Enter word..."
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={handlePlayWord} style={styles.playButton}>
                <Text style={styles.playButtonText}>🔊</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>Example Sentence (Optional):</Text>
          <Text style={styles.helpText}>
            Add a sentence using this word to help remember it better.
          </Text>
          
          <TextInput
            style={styles.exampleInput}
            multiline
            numberOfLines={4}
            placeholder={singleWord ? `For example: "The ${singleWord} was clearly visible."` : 'Enter an example sentence...'}
            value={singleExample}
            onChangeText={setSingleExample}
            autoCapitalize="sentences"
            autoCorrect={true}
          />

          {singleExample.trim() && (
            <TouchableOpacity onPress={handlePlayExample} style={styles.playExampleButton}>
              <Text style={styles.playExampleText}>🔊 Play Example Sentence</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.buttonGroup}>
            <Button
              title="Add Word"
              icon="✅"
              variant="success"
              onPress={handleSingleWordAdd}
            />
            <Button
              title="Back"
              icon="←"
              variant="secondary"
              onPress={() => setMode('choice')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Bulk Mode
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.helpText}>Enter words - one per line:</Text>
        
        <TextInput
          style={styles.bulkInput}
          multiline
          numberOfLines={10}
          placeholder="example&#10;spelling&#10;practice"
          value={bulkText}
          onChangeText={setBulkText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <View style={styles.buttonGroup}>
          <Button
            title="Add Words"
            icon="✅"
            variant="success"
            onPress={handleBulkAdd}
          />
          <Button
            title="Back"
            icon="←"
            variant="secondary"
            onPress={() => setMode('choice')}
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  choiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  choiceCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  choiceIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  choiceCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  choiceCardDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  wordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  singleWordInput: {
    flex: 1,
    fontSize: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  playButton: {
    backgroundColor: '#5b5fc7',
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  exampleInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  playExampleButton: {
    backgroundColor: '#e8f4f8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  playExampleText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '600',
  },
  bulkInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonGroup: {
    marginTop: 20,
  },
});
