import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WordCarousel from '@/components/WordCarousel/WordCarousel'; // Ensure this is the correct path to your WordCarousel component

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <WordCarousel />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
