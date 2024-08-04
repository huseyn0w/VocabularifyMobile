import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

const AboutScreen: React.FC = () => {
  const { theme } = useThemeContext();


  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Vocabulary Booster</Text>
      <Text style={[styles.text, { color: theme.text }]}>
        Vocabulary Booster is the application designed to help you expand your vocabulary effortlessly.
      </Text>
      <View style={styles.links}>
        <LinkButton url="https://github.com/huseyn0w/VocabularifyMobile" label="🚀 GitHub Project" theme={theme} />
        <LinkButton url="https://github.com/huseyn0w/Vocabularify" label="🖥️ Desktop version" theme={theme} />
        <LinkButton url="https://ehuseynov.net" label="👨‍💻 About the Author" theme={theme} />
        <LinkButton url="https://www.paypal.com/donate/?hosted_button_id=MMANJ7TC2SJMN" label="💖 Donate" theme={theme} />
      </View>
      <Text style={[styles.footer, { color: theme.text }]}>
        Created by Elman Huseynov.
      </Text>
      <Text style={[styles.footer, { color: theme.text }]}>
        All Rights Reserved.
      </Text>
    </ScrollView>
  );
};

const LinkButton: React.FC<{ url: string, label: string, theme: any }> = ({ url, label, theme }) => (
  <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.linkButton}>
    <Text style={[styles.link, { color: theme.text }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
  links: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  linkButton: {
    margin: 5,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  link: {
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AboutScreen;
