import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import AddWordsScreen from './src/screens/AddWordsScreen';
import ManualAddScreen from './src/screens/ManualAddScreen';
import CsvUploadScreen from './src/screens/CsvUploadScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import WordHistoryScreen from './src/screens/WordHistoryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: '#667eea' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: '🎓 Spelling Trainer' }} />
          <Stack.Screen name="AddWords" component={AddWordsScreen} options={{ title: 'Add Words' }} />
          <Stack.Screen name="ManualAdd" component={ManualAddScreen} options={{ title: 'Add Manually' }} />
          <Stack.Screen name="CsvUpload" component={CsvUploadScreen} options={{ title: 'Upload CSV' }} />
          <Stack.Screen name="Practice" component={PracticeScreen} options={{ title: 'Practice Session' }} />
          <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Results' }} />
          <Stack.Screen name="WordHistory" component={WordHistoryScreen} options={{ title: 'Word History' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}