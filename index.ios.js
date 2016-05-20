'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StatusBar
} = React;
StatusBar.setBarStyle('light-content', true);

var Garage = require('./app/components/garage');
AppRegistry.registerComponent('Garage', () => Garage);
