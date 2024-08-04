import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../utils/types';
import { useThemeContext } from '../context/ThemeContext';
import { PAYPAY_DONATION_URL } from '../utils/constants'

type SettingsScreenNavigationProp = StackNavigationProp<
  SettingsStackParamList,
  'SettingsScreen'
>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();

  const handleDonatePress = () => {
    Linking.openURL(PAYPAY_DONATION_URL);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
        <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('ModeScreen')}>
          <Text style={[styles.text, { color: theme.text }]}>Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('LanguageScreen')}>
          <Text style={[styles.text, { color: theme.text }]}>Language</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('BackgroundScreen')}>
          <Text style={[styles.text, { color: theme.text }]}>Background</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('AboutScreen')}>
          <Text style={[styles.text, { color: theme.text }]}>About</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.donateButton} onPress={handleDonatePress}>
        <Image source={require('../../assets/images/paypal_donate.png')} style={styles.donateImage} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  section: {
    borderRadius: 10,
    borderWidth: 1,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 18,
  },
  donateButton: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  donateImage: {
    width: 200,
    height: 50,
  },
});

export default SettingsScreen;
