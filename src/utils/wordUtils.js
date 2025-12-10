export const WordUtils = {
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  compareWords(userWord, correctWord) {
    const maxLen = Math.max(userWord.length, correctWord.length);
    const comparison = [];
    
    for (let i = 0; i < maxLen; i++) {
      const userChar = userWord[i] || '';
      const correctChar = correctWord[i] || '';
      
      comparison.push({
        userChar: userChar || '_',
        correctChar: correctChar || '_',
        isCorrect: userChar === correctChar,
      });
    }
    
    return comparison;
  },

  calculateAccuracy(correct, total) {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  },
};