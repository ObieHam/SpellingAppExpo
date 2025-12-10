import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export const CsvParser = {
  async pickAndParseFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', 'text/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { success: false, words: [] };
      }

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      
      const words = content
        .split(/[\n,\r]+/)
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length > 0);
      
      return { success: true, words };
    } catch (error) {
      console.error('File picker error:', error);
      return { success: false, words: [], error: error.message };
    }
  },

  parseText(text) {
    const words = text
      .split(/[\n,\r]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0);
    
    return words;
  },
};