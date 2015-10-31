'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StatusBarIOS
} = React;
StatusBarIOS.setStyle('light-content', true);

var Garage = require('./app/components/garage');
AppRegistry.registerComponent('Garage', () => Garage);