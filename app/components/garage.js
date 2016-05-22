import React, {
  Component,
} from 'react';

import {
  Dimensions,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import crypto from 'crypto-js';
import base64 from 'base-64';

import {get,post} from './api';

let {width} = Dimensions.get('window');

class Garage extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      doorStatus: 'loading',
      serverVersion: '?.?.?',
    };
  }

  preferencesLoaded() {
    return this.state.sharedSecret != '' && this.state.baseApi != ''
  }

  componentDidMount() {
    LayoutAnimation.spring();
    this.startPolling();
  }

  startPolling() {
    const pid = setInterval(this.garageStatus, 1500);
    this.setState({pid});
  }

  componentWillUnmount() {
    clearInterval(this.state.pid);
  }

  fullPath = (path) => {
    return `${this.state.baseApi}${path}`;
  }

  signString(string_to_sign, shared_secret) {
    const hmac = crypto.HmacSHA512(string_to_sign.toString(), shared_secret);
    return base64.encode(hmac)
  }

  loading() {
    this.setState({loading: true});
  }

  unloading() {
    this.setState({loading: false});
  }

  garageStatus = async() => {
    if (this.props.preferencesLoaded)
      try {
        let resp = await get(this.fullPath('/status'));
        if (resp !== null)
          resp.json().then(json => this.setState({doorStatus: json.door_status}));
      } catch(err) {
        console.log(err);
      }
  }

  toggleGarage = async() => {
    if (this.state.loading)
      return

    this.loading();

    const params = {"timestamp": Math.round(new Date().getTime()/1000)};
    const body = JSON.stringify(params);
    const signature = this.signString(body, this.state.sharedSecret);

    try {
      let resp = await post(this.fullPath('/'), body, signature);
      if (resp !== null)
        this.unloading();
    } catch(err) {
      console.log(err);
    }
  }

  missingPreferences() {
    return (
      <View style={styles.container}>
        <Text>Missing Preferences</Text>
        <Text>Please add them under settings</Text>
      </View>
    );
  }

  button() {
    const loading  = this.state.loading ? styles.buttonLoading : {};
    return (
      <View style={[styles.container, loading]}>
        <View style={styles.door_status}>
          <Text style={[styles.door_button, styles[this.state.doorStatus]]}>{this.state.doorStatus}</Text>
        </View>
        <TouchableHighlight
          style={styles.button}
          underlayColor='#74C0DC'
          onPress={this.toggleGarage}>
          <View />
        </TouchableHighlight>
      </View>
    );
  }

  render() {
    return (this.props.preferencesLoaded ? this.button() : this.missingPreferences());
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  buttonLoading: {
    opacity: 0.3,
  },
  door_status: {
    flex: 1,
    marginTop: 80,
  },
  door_button: {
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 5,
    padding: 8,
    width: 120,
  },
  closed: {
    backgroundColor: '#0069A4',
    color: 'white'
  },
  open: {
    backgroundColor: '#d75351',
    color: 'white'
  },
  loading: {
    opacity: 0.5,
    backgroundColor: '#777777',
    color: 'white'
  },
  button: {
    backgroundColor: '#86DEFF',
    borderRadius: 100,
    marginBottom: 10,
    padding: 10,
    justifyContent: 'center',
    height: 200,
    width: 200,
    borderColor: '#0069A4',
    borderWidth: 8,
    marginBottom: 150,
  },
});

module.exports = Garage;
