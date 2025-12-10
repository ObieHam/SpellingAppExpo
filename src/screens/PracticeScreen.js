import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '../components/Button';
import { SpeechService } from '../services/speech';
import { StorageService } from '../services/storage';
import { WordUtils } from '../utils/wordUtils';

export default function PracticeScreen({ navigation, route }) {
  const { words } = route.params;
  const [practiceWords, setPracticeWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentExample, setCurrentExample] = useState('');
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparison, setComparison] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [sessionMissed, setSessionMissed] = useState([]);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [showExampleInput, setShowExampleInput] = useState(false);
  const [newExample, setNewExample] = useState('');

  useEffect(() => {
    loadPracticeData();
    return () => {
      SpeechService.stop();
    };
  }, []);

  const loadPracticeData = async () => {
    const data = await StorageService.loadData();
    const shuffled = WordUtils.shuffleArray(words);
    setPracticeWords(shuffled);
    setCurrentWord(shuffled[0]);
    setCurrentExample(data.wordHistory[shuffled[0]]?.exampleSentence || '');
    
    setTimeout(() => {
      SpeechService.speakWord(shuffled[0]);
    }, 500);
  };

  const handleSpeakerPress = () => {
    SpeechService.speakWord(currentWord);
  };

  const handleSpeakerLongPress = () => {
    if (currentExample) {
      setIsLongPressing(true);
      SpeechService.speakWord(currentExample);
      setTimeout(() => setIsLongPressing(false), 500);
    } else {
      Alert.alert('No Example', 'This word does not have an example sentence yet. Add one below!');
    }
  };

  const handleSaveExample = async () => {
    if (!newExample.trim()) {
      Alert.alert('Empty', 'Please enter an example sentence.');
      return;
    }

    const data = await StorageService.loadData();
    if (!data.wordHistory[currentWord]) {
      data.wordHistory[currentWord] = { correct: 0, incorrect: 0, mistakes: [], exampleSentence: '' };
    }
    
    data.wordHistory[currentWord].exampleSentence = newExample.trim();
    await StorageService.saveData(data);
    
    setCurrentExample(newExample.trim());
    setNewExample('');
    setShowExampleInput(false);
    Alert.alert('Saved!', 'Example sentence has been added.');
  };

  const checkSpelling = async () => {
    if (!userInput.trim()) {
      Alert.alert('Empty Answer', 'Please type a word!');
      return;
    }

    const data = await StorageService.loadData();
    const input = userInput.trim().toLowerCase();

    if (!data.wordHistory[currentWord]) {
      data.wordHistory[currentWord] = { correct: 0, incorrect: 0, mistakes: [], exampleSentence: '' };
    }

    if (input === currentWord) {
      setFeedback('correct');
      setCorrectCount(prev => prev + 1);
      data.wordHistory[currentWord].correct++;

      const idx = data.misspelledWords.indexOf(currentWord);
      if (idx > -1) {
        data.misspelledWords.splice(idx, 1);
      }

      await StorageService.saveData(data);

      setTimeout(() => {
        nextWord();
      }, 1500);
    } else {
      setFeedback('incorrect');
      setIncorrectCount(prev => prev + 1);
      
      const comp = WordUtils.compareWords(input, currentWord);
      setComparison(comp);
      setShowComparison(true);

      data.wordHistory[currentWord].incorrect++;
      if (!data.wordHistory[currentWord].mistakes.includes(input)) {
        data.wordHistory[currentWord].mistakes.push(input);
      }

      if (!data.misspelledWords.includes(currentWord)) {
        data.misspelledWords.push(currentWord);
      }

      setSessionMissed(prev => [...new Set([...prev, currentWord])]);
      await StorageService.saveData(data);
    }
  };

  const nextWord = async () => {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= practiceWords.length) {
      navigation.replace('Results', {
        correct: correctCount + (feedback === 'correct' ? 1 : 0),
        incorrect: incorrectCount + (feedback === 'incorrect' ? 1 : 0),
        missedWords: sessionMissed,
      });
      return;
    }

    const data = await StorageService.loadData();
    setCurrentIndex(nextIndex);
    setCurrentWord(practiceWords[nextIndex]);
    setCurrentExample(data.wordHistory[practiceWords[nextIndex]]?.exampleSentence || '');
    setUserInput('');
    setFeedback(null);
    setShowComparison(false);
    setComparison([]);
    setShowExampleInput(false);
    setNewExample('');

    setTimeout(() => {
      SpeechService.speakWord(practiceWords[nextIndex]);
    }, 300);
  };

  const skipWord = () => {
    nextWord();
  };

  const endSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this practice session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            navigation.replace('Results', {
              correct: correctCount,
              incorrect: incorrectCount,
              missedWords: sessionMissed,
            });
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.progress}>
            Word {currentIndex + 1} of {practiceWords.length}
          </Text>
          <TouchableOpacity onPress={endSession} style={styles.endButton}>
            <Text style={styles.endButtonText}>End Session ✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.practiceArea}>
          <Text style={styles.label}>Type the word you hear:</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Type here..."
              autoCapitalize="none"
              autoCorrect={false}
              editable={feedback !== 'correct'}
              onSubmitEditing={checkSpelling}
            />
            <TouchableOpacity 
              onPress={handleSpeakerPress}
              onLongPress={handleSpeakerLongPress}
              delayLongPress={500}
              style={[styles.speakerBtn, isLongPressing && styles.speakerBtnActive]}
            >
              <Text style={styles.speakerIcon}>🔊</Text>
            </TouchableOpacity>
          </View>

          {/* Always show example section */}
          <View style={styles.exampleSection}>
            {currentExample ? (
              <View style={styles.exampleAvailable}>
                <Text style={styles.exampleLabel}>💡 Example sentence available</Text>
                <Text style={styles.exampleHint}>(Long press 🔊 to hear it)</Text>
              </View>
            ) : (
              <View style={styles.exampleUnavailable}>
                <TouchableOpacity 
                  onPress={() => setShowExampleInput(!showExampleInput)}
                  style={styles.exampleDropdown}
                >
                  <Text style={styles.exampleDropdownText}>
                    {showExampleInput ? '▼' : '▶'} Add example sentence
                  </Text>
                </TouchableOpacity>
                
                {showExampleInput && (
                  <View style={styles.exampleInputContainer}>
                    <TextInput
                      style={styles.exampleInput}
                      value={newExample}
                      onChangeText={setNewExample}
                      placeholder={`e.g., "The ${currentWord} was amazing."`}
                      multiline
                      autoCapitalize="sentences"
                    />
                    <TouchableOpacity onPress={handleSaveExample} style={styles.saveExampleBtn}>
                      <Text style={styles.saveExampleText}>💾</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.actionButtons}>
            {feedback !== 'correct' && feedback !== 'incorrect' && (
              <>
                <Button
                  title="Skip"
                  icon="▶"
                  variant="secondary"
                  onPress={skipWord}
                  style={styles.skipButton}
                />
                <Button
                  title="Check Spelling"
                  icon="→"
                  onPress={checkSpelling}
                  style={styles.checkButton}
                />
              </>
            )}
            {feedback === 'incorrect' && (
              <Button
                title="Next Word"
                icon="→"
                variant="success"
                onPress={nextWord}
              />
            )}
          </View>

          {feedback && (
            <View style={[
              styles.feedback,
              feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect
            ]}>
              <Text style={styles.feedbackText}>
                {feedback === 'correct' ? '✓ Correct! Well done!' : '✗ Incorrect. Compare your spelling:'}
              </Text>
            </View>
          )}

          {showComparison && (
            <View style={styles.comparisonContainer}>
              <Text style={styles.comparisonLabel}>Your answer:</Text>
              <View style={styles.comparisonRow}>
                {comparison.map((item, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.comparisonChar,
                      item.isCorrect ? styles.correctChar : styles.wrongChar
                    ]}
                  >
                    {item.userChar}
                  </Text>
                ))}
              </View>
              <Text style={[styles.comparisonLabel, { marginTop: 15 }]}>Correct spelling:</Text>
              <View style={styles.comparisonRow}>
                {currentWord.split('').map((char, idx) => (
                  <Text key={idx} style={[styles.comparisonChar, styles.correctChar]}>
                    {char}
                  </Text>
                ))}
              </View>
            </View>
          )}
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
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progress: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  endButton: {
    padding: 8,
  },
  endButtonText: {
    fontSize: 14,
    color: '#86868b',
  },
  practiceArea: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e5e7',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  speakerBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#5b5fc7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5b5fc7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  speakerBtnActive: {
    backgroundColor: '#4a4eb5',
    transform: [{ scale: 0.95 }],
  },
  speakerIcon: {
    fontSize: 24,
  },
  exampleSection: {
    marginBottom: 12,
  },
  exampleAvailable: {
    backgroundColor: '#e8f4f8',
    padding: 12,
    borderRadius: 8,
  },
  exampleLabel: {
    fontSize: 13,
    color: '#0066cc',
    fontWeight: '600',
  },
  exampleHint: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  exampleUnavailable: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e7',
  },
  exampleDropdown: {
    padding: 12,
  },
  exampleDropdownText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  exampleInputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 0,
    gap: 8,
  },
  exampleInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e5e7',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveExampleBtn: {
    backgroundColor: '#5b5fc7',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveExampleText: {
    fontSize: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  skipButton: {
    flex: 1,
  },
  checkButton: {
    flex: 2,
  },
  feedback: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  feedbackCorrect: {
    backgroundColor: '#d4edda',
  },
  feedbackIncorrect: {
    backgroundColor: '#f8d7da',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  comparisonContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  comparisonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  comparisonChar: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
    marginRight: 4,
  },
  correctChar: {
    color: '#28a745',
  },
  wrongChar: {
    color: '#dc3545',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
