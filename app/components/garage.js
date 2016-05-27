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

let {width} = Dimensions.get('window');
import {blue, darkBlue, red} from './colors';

class Garage extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      doorStatus: 'loading',
    };
  }

  componentDidMount() {
    this.startPolling();
  }

  startPolling() {
    const pid = setInterval(this.getStatus, 1500);
    this.setState({pid});
  }

  componentWillUnmount() {
    clearInterval(this.state.pid);
  }

  loading() {
    this.setState({loading: true});
  }

  unloading() {
    this.setState({loading: false});
  }

  getStatus = async() => {
    if (this.props.preferencesLoaded)
      try {
          let resp = await this.props.get('status');
          if (resp && resp.ok) {
            resp.json().then(json => this.setState({doorStatus: json.doorStatus}));
          } else if (resp && !resp.ok) {
            this.props.dispatch({key: 'ERROR', type: 'API'})
            clearInterval(this.state.pid)
          }
      } catch(err) {
        console.log(err);
      }
  }

  toggleGarage = async() => {
    if (this.state.loading)
      return

    this.loading();

    try {
      let resp = await this.props.get('toggle');
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
      <View style={styles.container}>
        <View style={styles.door_status}>
          <Text style={[styles.door_button, styles[this.state.doorStatus]]}>{this.state.doorStatus}</Text>
        </View>
        <TouchableHighlight
          style={[styles.button, loading]}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  door_button: {
    overflow: 'hidden',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 5,
    padding: 8,
    width: 120,
  },
  closed: {
    backgroundColor: blue,
    color: 'white'
  },
  open: {
    backgroundColor: red,
    color: 'white'
  },
  loading: {
    opacity: 0.5,
    backgroundColor: '#777777',
    color: 'white'
  },
  button: {
    backgroundColor: blue,
    borderRadius: 100,
    marginBottom: 10,
    padding: 10,
    justifyContent: 'center',
    height: 200,
    width: 200,
    marginBottom: 150,
  },
});

module.exports = Garage;
