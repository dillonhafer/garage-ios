import React, {
  Component,
} from 'react';

import {
  AppRegistry,
  AppState,
  Dimensions,
  Image,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import crypto from 'crypto-js';
import base64 from 'base-64';
import UserDefaults from 'react-native-userdefaults-ios';
import SideMenu from 'react-native-side-menu';

import {get,post} from './api';

let {height, width} = Dimensions.get('window');

class Menu extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View style={styles.menuBackground}>
        <View style={styles.menu}>
          <Text style={styles.menuTitle}>Garage iOS</Text>
          <Text style={styles.menuSubTitle}>Server Version v{this.props.serverVersion}</Text>
          <View style={styles.center}>
            <TouchableHighlight
              style={styles.touchButton}
              underlayColor='#333333'
              onPress={() =>{}}>
              <Text style={styles.touchButtonText}>View Logs</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }
}

class Garage extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      sharedSecret: '',
      baseApi: '',
      doorStatus: 'loading',
      serverVersion: '',
    };
  }

  preferencesLoaded() {
    return this.state.sharedSecret != '' && this.state.baseApi != ''
  }

  componentDidMount() {
    LayoutAnimation.spring();
    this.loadPreferences();
    this.startPolling();
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  startPolling() {
    const pid = setInterval(this.garageStatus, 1500);
    this.setState({pid});
  }

  componentWillUnmount() {
    clearInterval(this.state.pid);
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (currentAppState) => {
    if (currentAppState === 'active') {
      this.loadPreferences();
    }
  }

  loadServerVersion = async() => {
    try {
      let resp = await get(this.fullPath('/version'));
      if (resp !== null)
        resp.json().then(json => this.setState({serverVersion: json.version}));
    } catch(err) {
      console.log(err);
    }
  }

  loadPreferences = async() => {
    try {
      let baseApi = await UserDefaults.stringForKey('server_address_preference');
      if (baseApi !== null)
        this.setState({baseApi: baseApi.trim()});
        this.loadServerVersion();

      let sharedSecret = await UserDefaults.stringForKey('shared_secret_preference');
      if (sharedSecret !== null)
        this.setState({sharedSecret: sharedSecret.trim()});
    } catch(err) {
      console.log(err);
    }
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
    if (this.preferencesLoaded())
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
    const preferencesLoaded = this.preferencesLoaded();
    const menu = <Menu serverVersion={this.state.serverVersion} />;
    return (
      <SideMenu
        menu={menu}
        disableGestures={!preferencesLoaded}
        openMenuOffset={width - 60}
        edgeHitWidth={width}
        >
        {preferencesLoaded ? this.button() : this.missingPreferences()}
      </SideMenu>
    )
  }
}

const styles = StyleSheet.create({
  menuBackground: {
    backgroundColor: '#555555',
    height: height,
    width: width,
  },
  menu: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
    width: width - 60,
  },
  menuTitle: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  menuSubTitle: {
    color: '#AAA',
    textAlign: 'center',
    fontSize: 16,
  },

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
  touchButton: {
    alignItems: 'center',
    backgroundColor: '#777777',
    borderRadius: 5,
    justifyContent: 'center',
    marginTop: 30,
    padding: 8,
    width: 120,
  },
  touchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});

module.exports = Garage;
