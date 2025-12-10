import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '../components/Button';
import { StorageService } from '../services/storage';

export default function ManualAddScreen({ navigation }) {
  const [text, setText] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');

  const handleAddWords = async () => {
    if (!text.trim()) {
      Alert.alert('No Words', 'Please enter at least one word!');
      return;
    }

    const words = text
      .split('\n')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0);

    if (words.length === 0) {
      Alert.alert('No Words', 'Please enter at least one valid word!');
      return;
    }

    if (words.length > 1 && exampleSentence.trim()) {
      Alert.alert(
        'Multiple Words',
        'You entered multiple words but only one example sentence. The example will only be added to the first word. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => saveWords(words) }
        ]
      );
    } else {
      await saveWords(words);
    }
  };

  const saveWords = async (words) => {
    const data = await StorageService.loadData();
    let addedCount = 0;

    words.forEach((word, index) => {
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

      // Add example sentence only to the first word if multiple words entered
      if (index === 0 && exampleSentence.trim()) {
        data.wordHistory[word].exampleSentence = exampleSentence.trim();
      }
    });

    await StorageService.saveData(data);
    
    Alert.alert(
      'Success!',
      `Added ${addedCount} new word(s)!${exampleSentence.trim() && words.length === 1 ? ' (with example sentence)' : ''}`,
      [
        {
          text: 'Add More',
          onPress: () => {
            setText('');
            setExampleSentence('');
          },
        },
        {
          text: 'Start Practice',
          onPress: () => navigation.navigate('Practice', { type: 'all', words: data.allWords }),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.helpText}>Enter word(s) - one per line:</Text>
        
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={6}
          placeholder="example&#10;spelling&#10;practice"
          value={text}
          onChangeText={setText}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.helpText}>
          💡 Optional: Add an example sentence for the word{'\n'}
          (Only works when adding a single word)
        </Text>
        
        <TextInput
          style={styles.exampleInput}
          multiline
          numberOfLines={3}
          placeholder="For example: 'The cat sat on the mat.'"
          value={exampleSentence}
          onChangeText={setExampleSentence}
          autoCapitalize="sentences"
          autoCorrect={true}
        />
        
        <View style={styles.buttonGroup}>
          <Button
            title="Add Words"
            icon="✅"
            variant="success"
            onPress={handleAddWords}
          />
          <Button
            title="Back"
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  exampleInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  buttonGroup: {
    marginTop: 20,
  },
});