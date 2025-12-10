import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Button from '../components/Button';
import WordItem from '../components/WordItem';
import { CsvParser } from '../utils/csvParser';
import { StorageService } from '../services/storage';

export default function CsvUploadScreen({ navigation }) {
  const [uploadedWords, setUploadedWords] = useState([]);
  const [fileName, setFileName] = useState('');

  const handlePickFile = async () => {
    const result = await CsvParser.pickAndParseFile();
    
    if (result.success) {
      setUploadedWords(result.words);
      setFileName('File uploaded successfully');
      Alert.alert('Success!', `Found ${result.words.length} word(s) in the file.`);
    } else if (result.error) {
      Alert.alert('Error', `Failed to read file: ${result.error}`);
    }
  };

  const handleSaveWords = async () => {
    if (uploadedWords.length === 0) {
      Alert.alert('No Words', 'Please upload a file first!');
      return;
    }

    const data = await StorageService.loadData();
    let addedCount = 0;

    uploadedWords.forEach(word => {
      if (!data.allWords.includes(word)) {
        data.allWords.push(word);
        addedCount++;
        
        if (!data.wordHistory[word]) {
          data.wordHistory[word] = { correct: 0, incorrect: 0, mistakes: [] };
        }
      }
    });

    await StorageService.saveData(data);
    
    Alert.alert(
      'Success!',
      `Added ${addedCount} new word(s)!`,
      [
        {
          text: 'Upload Another',
          onPress: () => {
            setUploadedWords([]);
            setFileName('');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.helpText}>
        CSV should have one word per line or comma-separated words
      </Text>
      
      <Button
        title="Choose File"
        icon="📁"
        onPress={handlePickFile}
      />

      {fileName && (
        <Text style={styles.fileName}>{fileName}</Text>
      )}

      {uploadedWords.length > 0 && (
        <View style={styles.wordListContainer}>
          <Text style={styles.wordListTitle}>Uploaded Words ({uploadedWords.length}):</Text>
          <View style={styles.wordList}>
            {uploadedWords.slice(0, 20).map((word, index) => (
              <WordItem key={index} word={word} />
            ))}
            {uploadedWords.length > 20 && (
              <Text style={styles.moreText}>
                ... and {uploadedWords.length - 20} more words
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.buttonGroup}>
        {uploadedWords.length > 0 && (
          <Button
            title="Save & Start Practice"
            icon="✅"
            variant="success"
            onPress={handleSaveWords}
          />
        )}
        <Button
          title="Back"
          icon="←"
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
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  fileName: {
    fontSize: 14,
    color: '#28a745',
    textAlign: 'center',
    marginTop: 10,
  },
  wordListContainer: {
    marginTop: 20,
  },
  wordListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  wordList: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    maxHeight: 300,
  },
  moreText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  buttonGroup: {
    marginTop: 20,
  },
});