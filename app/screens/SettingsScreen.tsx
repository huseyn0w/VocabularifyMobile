import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../types';

type SettingsScreenNavigationProp = StackNavigationProp<
  SettingsStackParamList,
  'SettingsScreen'
>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ModeScreen')}>
          <Text style={styles.text}>Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('LanguageScreen')}>
          <Text style={styles.text}>Language</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AboutScreen')}>
          <Text style={styles.text}>About</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4',
    padding: 15,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderColor: '#C7C7CC',
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  text: {
    fontSize: 18,
    color: '#000000',
  },
});

export default SettingsScreen;
