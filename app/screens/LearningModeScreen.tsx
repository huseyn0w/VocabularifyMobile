import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '../utils/types';
import { useThemeContext } from '../context/ThemeContext';
import { useLanguageContext } from '../context/LanguageContext';
import { PAYPAY_DONATION_URL } from '../utils/constants';

type LearningModeScreenNavigationProp = StackNavigationProp<
  SettingsStackParamList,
  'LearningModeScreen'
>;

type Props = {
  navigation: LearningModeScreenNavigationProp;
};

const LearningModeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { mode, setMode } = useLanguageContext();

  const handleModeSelect = async (selectedMode: string) => {
    setMode(selectedMode);
  };

  const handleDonatePress = () => {
    Linking.openURL(PAYPAY_DONATION_URL);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.section, { backgroundColor: theme.sectionBackground, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: theme.border }]}
          onPress={() => handleModeSelect('showBoth')}
        >
          <Text style={[styles.text, { color: theme.text }]}>
            Show Word and Translation Together {mode === 'showBoth' && '✓'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: theme.border }]}
          onPress={() => handleModeSelect('showWordThenTranslation')}
        >
          <Text style={[styles.text, { color: theme.text }]}>
            Show Word First, Then Translation {mode === 'showWordThenTranslation' && '✓'}
          </Text>
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

export default LearningModeScreen;
