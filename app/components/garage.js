'use strict';

var crypto = require('crypto-js');
var base64 = require('base-64');
var UserDefaults = require('react-native-userdefaults-ios');
var React = require('react-native');
var {
  AlertIOS,
  AsyncStorage,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} = React;

var Garage = React.createClass({
  getInitialState: function() {
    return {
      loading: false,
      sharedSecret: '',
      baseApi: ''
    }
  },
  preferencesLoaded: function() {
    return this.state.sharedSecret.trim() != '' && this.state.baseApi.trim() != ''
  },
  componentDidMount: function() {
    this._loadPreferences();
  },
  _loadPreferences: function() {
    var self = this;
    UserDefaults.stringForKey('server_address_preference')
      .then(value => {
        if (value !== null) {
          self.setState({baseApi: value});
        }
      });
    UserDefaults.stringForKey('shared_secret_preference')
      .then(value => {
        if (value !== null) {
          self.setState({sharedSecret: value});
        }
      });
  },
  signString: function(string_to_sign, shared_secret) {
    var hmac = crypto.HmacSHA512(string_to_sign.toString(), shared_secret);
    return base64.encode(hmac)
  },
  fullPath: function(path) {
    return `${this.state.baseApi}${path}`;
  },
  get: function(path, params) {
    var fullPath = this.fullPath(path);
    return fetch(fullPath, Object.assign({
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }));
  },
  loading: function() {
    this.setState({loading: true})
  },
  unloading: function() {
    this.setState({loading: false})
  },
  toggleGarage: function() {
    if (this.state.loading)
      return

    var self = this;
    self.loading();

    var timestamp = Math.round(new Date().getTime()/1000);
    var signature = this.signString(timestamp, this.state.sharedSecret);
    this.get('/', {
      timestamp: timestamp,
      signature: signature
    }).then((r) => self.unloading());
  },
  missingPreferences: function() {
    return (
      <View style={styles.container}>
        <Text>Missing Preferences</Text>
        <Text>Please add them under settings</Text>
      </View>
    );
  },
  button: function() {
    var loading = this.state.loading ? styles.loading : {};
    var text = this.state.loading ? 'Please wait...' : 'Toggle Garage Doori';
    return (
      <View style={[styles.container, loading]}>
         <TouchableHighlight
          style={styles.button}
          underlayColor='#74C0DC'
          onPress={this.toggleGarage}>
          <Text style={styles.buttonText}></Text>
        </TouchableHighlight>
      </View>
    );
  },
  render: function() {
    return this.preferencesLoaded() ? this.button() : this.missingPreferences()
  }
});

var styles = StyleSheet.create({
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