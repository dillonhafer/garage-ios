import React, {
  Component,
} from 'react';

import {
  AppRegistry,
  AppState,
  Dimensions,
} from 'react-native';

import SideMenu from 'react-native-side-menu';
import UserDefaults from 'react-native-userdefaults-ios';

import Garage from './app/components/garage';
import Menu from './app/components/menu';
import {get} from './app/components/api';

let {width} = Dimensions.get('window');

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      sharedSecret: '',
      baseApi: '',
      serverVersion: '?.?.?',
    };
  }

  componentDidMount() {
    this.loadPreferences();
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  fullPath = (path) => {
    return `${this.state.baseApi}${path}`;
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

  preferencesLoaded() {
    return this.state.sharedSecret !== '' && this.state.baseApi !== ''
  }

  render() {
    const menu = <Menu serverVersion={this.state.serverVersion} />;
    const preferencesLoaded = this.preferencesLoaded();

    return (
      <SideMenu
        menu={menu}
        disableGestures={!preferencesLoaded}
        openMenuOffset={width - 60}
        edgeHitWidth={width}
        >
        <Garage preferencesLoaded={preferencesLoaded} />
      </SideMenu>
    )
  }
}

AppRegistry.registerComponent('Garage', () => App);
