import React, {
  Component,
} from 'react';

import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
let {height, width} = Dimensions.get('window');

class Menu extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View style={styles.background}>
        <View style={styles.container}>
          <Text style={styles.title}>Garage iOS</Text>
          <Text style={styles.subTitle}>Server v{this.props.serverVersion}</Text>
          <View style={styles.center}>
            <TouchableHighlight
              style={styles.logsButton}
              underlayColor='#333333'
              onPress={() => this.props.dispatch({key: 'SCENE', scene: 'logs'})}>
              <Text style={styles.logsButtonText}>View Logs</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#555555',
    height: height,
    width: width,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
    width: width - 60,
  },
  title: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  subTitle: {
    color: '#AAA',
    textAlign: 'center',
    fontSize: 16,
  },
  logsButton: {
    alignItems: 'center',
    backgroundColor: '#777777',
    borderRadius: 5,
    justifyContent: 'center',
    marginTop: 30,
    padding: 8,
    width: 120,
  },
  logsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

module.exports = Menu;