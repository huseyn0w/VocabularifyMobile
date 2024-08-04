import { Ionicons } from '@expo/vector-icons';

export const getTabBarIconName = (routeName: string): keyof typeof Ionicons.glyphMap => {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Settings':
      return 'settings';
    default:
      return 'home';
  }
};
