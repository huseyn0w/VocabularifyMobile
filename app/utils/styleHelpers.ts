import { ViewStyle, TextStyle } from 'react-native';
import { Appearance } from 'react-native';

export const getBackgroundStyle = (background: string): ViewStyle => {
  switch (background) {
    case 'white':
      return { backgroundColor: '#FFFFFF' };
    case 'dark':
      return { backgroundColor: '#000000' };
    case 'system':
      return { backgroundColor: Appearance.getColorScheme() === 'dark' ? '#000000' : '#FFFFFF' };
    default:
      return {};
  }
};

export const getTextColorStyle = (background: string): TextStyle => {
  console.log(Appearance.getColorScheme())
  switch (background) {
    case 'dark':
      return { color: '#FFFFFF' };
    case 'white':
        return { color: '#000' };
    case 'system':
      return { color: Appearance.getColorScheme() === 'dark' ? '#FFFFFF' : '#000' };
    default:
      return { color: '#FFFFFF' };
  }
};

export const getBorderColorStyle = (background: string): ViewStyle => {
  switch (background) {
    case 'dark':
      return { borderColor: "#C7C7CC" };
    case 'system':
      return { borderColor: Appearance.getColorScheme() === 'dark' ? '#FFFFFF' : '#C7C7CC' };
    case 'white':
      return { borderColor: '#C7C7CC' };
    default:
      return { borderColor: '#C7C7CC' };
  }
};
