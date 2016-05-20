import {
  AppRegistry,
  StatusBar
} from 'react-native';

import Garage from './app/components/garage';

StatusBar.setBarStyle('light-content', true);
AppRegistry.registerComponent('Garage', () => Garage);
