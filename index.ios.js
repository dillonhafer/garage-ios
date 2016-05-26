import React, {
  Component,
} from 'react';

import {
  AppRegistry,
  AppState,
  LayoutAnimation,
  Dimensions,
} from 'react-native';

import SideMenu from 'react-native-side-menu';
import UserDefaults from 'react-native-userdefaults-ios';

import Garage from './app/components/garage';
import Menu from './app/components/menu';
import Logs from './app/components/logs';
import {authenticatedGet} from './app/components/api';

let {width} = Dimensions.get('window');

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      scene: 'home',
      sharedSecret: '',
      baseApi: '',
      serverVersion: '?.?.?',
      doorStatus: 'loading',
    };
  }

  componentDidMount() {
    LayoutAnimation.spring();
    this.loadPreferences();
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  get = async(path) => {
    const fullPath = `${this.state.baseApi}/${path}`;
    return authenticatedGet(fullPath, this.state.sharedSecret)
  }

  handleAppStateChange = (currentAppState) => {
    if (currentAppState === 'active') {
      this.loadPreferences();
    }
  }

  loadServerVersion = async() => {
    try {
      let resp = await this.get('version');
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

      let sharedSecret = await UserDefaults.stringForKey('shared_secret_preference');
      if (sharedSecret !== null)
        this.setState({sharedSecret: sharedSecret.trim()});
        this.loadServerVersion();
    } catch(err) {
      console.log(err);
    }
  }

  preferencesLoaded() {
    return this.state.sharedSecret !== '' && this.state.baseApi !== ''
  }

  updateScene(scene) {
    this.setState({scene});
  }

  error = (type) => {
    let msg;
    switch (type) {
      case "API":
        msg = `Could not connect to the API: ${this.state.baseApi}`;
        break;
    }
    
    if (msg)
      alert(msg);
  }

  currentView = (preferencesLoaded) => {
    switch (this.state.scene) {
      case 'home':
        return <Garage dispatch={this.dispatch} preferencesLoaded={preferencesLoaded} get={this.get} />;
      case 'logs':
        return <Logs dispatch={this.dispatch} sharedSecret={this.state.sharedSecret} />
    }
  }

  dispatch = (props) => {
    switch (props.key) {
      case 'SCENE':
        this.updateScene(props.scene);
      case 'ERROR':
        this.error(props.type);
    }
  }

  render() {
    const menu = <Menu serverVersion={this.state.serverVersion} dispatch={this.dispatch} />;
    const preferencesLoaded = this.preferencesLoaded();
    const view = this.currentView(preferencesLoaded);

    return (
      <SideMenu
        menu={menu}
        disableGestures={!preferencesLoaded}
        openMenuOffset={width - 60}
        edgeHitWidth={width}
        >
        {view}
      </SideMenu>
    )
  }
}

AppRegistry.registerComponent('Garage', () => App);
