import React, { useEffect, useState } from 'react';
import { Text, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, Easing, useReducedMotion } from 'react-native-reanimated';
import { useLanguageContext } from '../context/LanguageContext';
import { Language, RootStackParamList } from '../utils/types';
import { setLanguageSettings } from '../services/storage';
import { duration, letterSpacing } from '../theme/tokens';
import ScreenContainer from '../components/ScreenContainer';
import LanguageSelector from '../components/LanguageSelector';

type WelcomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const { setSettings } = useLanguageContext();
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const reducedMotion = useReducedMotion();
  const [learningLanguage, setLearningLanguage] = useState<Language | null>(null);
  const [knownLanguage, setKnownLanguage] = useState<Language | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    if (learningLanguage && knownLanguage && level) {
      const settings = {
        learningLanguage: learningLanguage.toLowerCase(),
        knownLanguage: knownLanguage.toLowerCase(),
        level: level.toLowerCase(),
      };
      await setLanguageSettings(settings);
      setSettings(settings);
      navigation.navigate('Main');
    }
  };

  const showConfirmation = () => {
    Alert.alert(
      'Confirm Selection',
      'Are you sure you want to save these settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: handleSaveSettings },
      ],
      { cancelable: false },
    );
  };

  useEffect(() => {
    if (learningLanguage && knownLanguage && level) {
      showConfirmation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningLanguage, knownLanguage, level]);

  const headerEntering = reducedMotion
    ? FadeIn.duration(duration.base)
    : FadeInDown.duration(duration.slow).easing(Easing.bezier(0.23, 1, 0.32, 1).factory());

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScreenContainer scroll>
        <Animated.View entering={headerEntering} className="mb-8 mt-6">
          <Text
            className="font-display-semibold text-5xl leading-[52px] text-ink"
            style={{ letterSpacing: letterSpacing.display }}
          >
            Set up your{'\n'}vocabulary journey
          </Text>
          <Text className="mt-4 font-sans text-base leading-6 text-ink-muted">
            Choose what you want to learn and where you're starting from.
          </Text>
        </Animated.View>

        <LanguageSelector
          learningLanguage={learningLanguage}
          knownLanguage={knownLanguage}
          level={level}
          onSelectLearning={(language) => {
            setLearningLanguage(language);
            setKnownLanguage(null);
            setLevel(null);
          }}
          onSelectKnown={(language) => {
            setKnownLanguage(language);
            setLevel(null);
          }}
          onSelectLevel={setLevel}
        />
      </ScreenContainer>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
