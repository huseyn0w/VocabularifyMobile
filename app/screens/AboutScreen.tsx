import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, FadeIn, Easing, useReducedMotion } from 'react-native-reanimated';
import { PAYPAY_DONATION_URL } from '../utils/constants';
import { duration } from '../theme/tokens';
import ScreenContainer from '../components/ScreenContainer';
import LinkRow from '../components/LinkRow';

const AboutScreen: React.FC = () => {
  const reducedMotion = useReducedMotion();

  const entering = reducedMotion
    ? FadeIn.duration(duration.base)
    : FadeInDown.duration(duration.slow).easing(Easing.bezier(0.23, 1, 0.32, 1).factory());

  return (
    <ScreenContainer scroll>
      <Animated.View entering={entering} className="mb-8 mt-4">
        <Text className="font-sans text-sm uppercase tracking-[2px] text-accent">
          About
        </Text>
        <Text className="mt-2 font-display-semibold text-4xl text-ink">Vocabulary Booster</Text>
        <Text className="mt-3 font-sans text-base leading-6 text-ink-muted">
          Vocabulary Booster is designed to help you expand your vocabulary effortlessly —
          one word at a time, at your own pace.
        </Text>
      </Animated.View>

      <View className="mb-8">
        <LinkRow
          url="https://github.com/huseyn0w/VocabularifyMobile"
          label="GitHub project"
          icon="logo-github"
        />
        <LinkRow
          url="https://github.com/huseyn0w/Vocabularify"
          label="Desktop version"
          icon="desktop-outline"
        />
        <LinkRow
          url="https://ehuseynov.net"
          label="About the author"
          icon="person-outline"
        />
        <LinkRow url={PAYPAY_DONATION_URL} label="Like the app? Donate" icon="heart-outline" />
      </View>

      <View className="mt-auto items-center pt-6">
        <Text className="font-medium text-sm text-ink-muted">Created by Elman Huseynov</Text>
        <Text className="mt-1 font-sans text-xs text-ink-subtle">All rights reserved.</Text>
      </View>
    </ScreenContainer>
  );
};

export default AboutScreen;
