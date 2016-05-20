import React, {
  Component,
} from 'react';

import {
  AppRegistry,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
} from 'react-native';

import crypto from 'crypto-js';
import base64 from 'base-64';
import UserDefaults from 'react-native-userdefaults-ios';

class Garage extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      sharedSecret: '',
      baseApi: '',
      doorStatus: ''
    };
  }

  preferencesLoaded() {
    return this.state.sharedSecret != '' && this.state.baseApi != ''
  }

  componentDidMount() {
    this.loadPreferences();
    setInterval(this.garageStatus, 1000);
  }

  loadPreferences = async() => {
    try {
      let baseApi = await UserDefaults.stringForKey('server_address_preference');
      if (baseApi !== null)
        this.setState({baseApi: baseApi.trim()});

      let sharedSecret = await UserDefaults.stringForKey('shared_secret_preference');
      if (sharedSecret !== null)
        this.setState({sharedSecret: sharedSecret.trim()});
    } catch(err) {
      console.log(err);
    }
  }

  signString(string_to_sign, shared_secret) {
    const hmac = crypto.HmacSHA512(string_to_sign.toString(), shared_secret);
    return base64.encode(hmac)
  }

  get(path, body, signature) {
    const fullPath = `${this.state.baseApi}${path}`;
    return fetch(fullPath, Object.assign({
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        signature
      },
      body
    }));
  }

  loading() {
    this.setState({loading: true});
  }

  unloading() {
    this.setState({loading: false});
  }

  garageStatus = async() => {
    if (this.preferencesLoaded())
      try {
        let resp = await this.get('/status', '', '');
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
      let resp = await this.get('/', body, signature);
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
    const loading = this.state.loading ? styles.loading : {};
    return (
      <View style={[styles.container, loading]}>
        <Text style={[styles.door_status, styles[this.state.doorStatus]]}>{this.state.doorStatus}</Text>
        <TouchableHighlight
          style={styles.button}
          underlayColor='#74C0DC'
          onPress={this.toggleGarage}>
          <Text style={styles.buttonText}></Text>
        </TouchableHighlight>
      </View>
    );
  }

  render() {
    return this.preferencesLoaded() ? this.button() : this.missingPreferences();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  loading: {
    opacity: 0.3
  },
  door_status: {
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 5,
    padding: 8,
    width: 120,
    position: 'relative',
    top: -100
  },
  closed: {
    backgroundColor: '#0069A4',
    color: 'white'
  },
  open: {
    backgroundColor: '#d75351',
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

  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

module.exports = Garage;
