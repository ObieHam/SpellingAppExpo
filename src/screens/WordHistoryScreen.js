import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Button from '../components/Button';
import { StorageService } from '../services/storage';
import { WordUtils } from '../utils/wordUtils';

export default function WordHistoryScreen({ navigation }) {
  const [wordHistory, setWordHistory] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterAndSortWords();
  }, [wordHistory, searchQuery]);

  const loadHistory = async () => {
    const data = await StorageService.loadData();
    setWordHistory(data.wordHistory || {});
  };

  const filterAndSortWords = () => {
    let words = Object.entries(wordHistory);

    // Filter by search query
    if (searchQuery.trim()) {
      words = words.filter(([word]) => 
        word.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by most incorrect (total incorrect count)
    words.sort((a, b) => {
      return b[1].incorrect - a[1].incorrect;
    });

    setFilteredWords(words);
  };

  const handleDeleteWord = async (word) => {
    Alert.alert(
      'Delete Word',
      `Are you sure you want to completely remove "${word}" from all practice lists and history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const data = await StorageService.loadData();
            
            // Remove from wordHistory
            delete data.wordHistory[word];
            
            // Remove from allWords
            data.allWords = data.allWords.filter(w => w !== word);
            
            // Remove from misspelledWords
            data.misspelledWords = data.misspelledWords.filter(w => w !== word);
            
            await StorageService.saveData(data);
            
            // Reload history
            await loadHistory();
            
            Alert.alert('Deleted', `"${word}" has been removed.`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search words..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {filteredWords.length === 0 && !searchQuery ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📚</Text>
            <Text style={styles.emptyTitle}>No Practice History Yet</Text>
            <Text style={styles.emptySubtext}>
              Start practicing to see your progress!
            </Text>
          </View>
        ) : filteredWords.length === 0 && searchQuery ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🔍</Text>
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptySubtext}>
              Try a different search term
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Sorted by most misspelled • {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''}
            </Text>
            
            <View style={styles.historyList}>
              {filteredWords.map(([word, history]) => {
                const total = history.correct + history.incorrect;
                const accuracy = WordUtils.calculateAccuracy(history.correct, total);
                
                return (
                  <View key={word} style={styles.historyItem}>
                    <View style={styles.wordHeader}>
                      <Text style={styles.wordText}>{word}</Text>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          onPress={() => navigation.navigate('EditWord', { word })}
                          style={styles.editButton}
                        >
                          <Text style={styles.editButtonText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDeleteWord(word)}
                          style={styles.deleteButton}
                        >
                          <Text style={styles.deleteButtonText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.statsRow}>
                      <Text style={styles.correctText}>✓ Correct: {history.correct}</Text>
                      <Text style={styles.incorrectText}>✗ Incorrect: {history.incorrect}</Text>
                      <Text style={styles.accuracyText}>Accuracy: {accuracy}%</Text>
                    </View>
                    
                    {history.exampleSentence && (
                      <View style={styles.exampleContainer}>
                        <Text style={styles.exampleLabel}>💡 Example:</Text>
                        <Text style={styles.exampleText}>{history.exampleSentence}</Text>
                      </View>
                    )}
                    
                    {history.mistakes && history.mistakes.length > 0 && (
                      <View style={styles.mistakesContainer}>
                        <Text style={styles.mistakesLabel}>Past mistakes:</Text>
                        <Text style={styles.mistakesText}>
                          {history.mistakes.join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Back to Home"
          icon="🏠"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e7',
  },
  clearButton: {
    marginLeft: 10,
    padding: 8,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  historyList: {
    marginBottom: 20,
  },
  historyItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  wordText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    padding: 5,
  },
  editButtonText: {
    fontSize: 20,
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  correctText: {
    fontSize: 14,
    color: '#28a745',
  },
  incorrectText: {
    fontSize: 14,
    color: '#dc3545',
  },
  accuracyText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  exampleContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e7',
  },
  exampleLabel: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '600',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  mistakesContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e7',
  },
  mistakesLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  mistakesText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e7',
  },
});