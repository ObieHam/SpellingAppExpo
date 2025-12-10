import * as Speech from 'expo-speech';

export const SpeechService = {
  async speakWord(word) {
    try {
      await Speech.stop();
      await Speech.speak(word, {
        rate: 0.8,
        pitch: 1.0,
        language: 'en-US',
      });
    } catch (error) {
      console.error('Error speaking word:', error);
    }
  },

  async stop() {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  },
};