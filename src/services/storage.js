import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'spellingTrainerData';

export const StorageService = {
  async saveData(data) {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEY, jsonData);
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  },

  async loadData() {
    try {
      const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonData !== null) {
        return JSON.parse(jsonData);
      }
      return {
        allWords: [],
        misspelledWords: [],
        wordHistory: {},
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return {
        allWords: [],
        misspelledWords: [],
        wordHistory: {},
      };
    }
  },

  async clearData() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },
};