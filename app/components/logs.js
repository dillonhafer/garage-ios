import React, {
  Component,
} from 'react';

import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  ListView,
  View,
} from 'react-native';

let {height, width} = Dimensions.get('window');
import {blue, green, red} from './colors';

class Logs extends React.Component {
  constructor() {
    super();
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      logEntries: ds.cloneWithRows([]),
    }
  }

  componentDidMount() {
    this.getLogs();
  }

  getLogs = async() => {
    try {
      let resp = await this.props.get('logs');
      if (resp && resp.ok) {
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        resp.json().then(json => this.setState({logEntries: ds.cloneWithRows(json.logs)}));
      } else {
        this.props.dispatch({key: 'ERROR', type: 'API'});
      }
    } catch(err) {
      console.log(err);
    }
  }

  renderlogEntries() {
    return (
      <ListView
        enableEmptySections={true}
        dataSource={this.state.logEntries}
        renderRow={this.getLogEntry}
      />
    );
  }

  getLogEntry = (entry, sectionID, rowID, highlightRow) => {
    const message = entry.type === 'Toggle' ? 'The door was toggled' : '???';
    const isCurrent = new Date(entry.date).toDateString() === new Date().toDateString();
    const current = isCurrent ? styles.currentLog : {};

    return (
      <View style={styles.logEntryContainer} key={"log_"+rowID}>
        <View style={styles.header}>
          <Text style={[styles.headerText, current]}>{entry.date}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.time}>
            <Text style={styles.timeText}>{entry.time}</Text>
          </View>
          <View style={[styles.verticalSeparator, styles['line'+entry.type]]} />
          <View style={styles.message}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.background}>
        {this.renderlogEntries()}
        <View style={styles.doneContainer}>
          <TouchableHighlight
              style={styles.logsButton}
              underlayColor='#333333'
              onPress={() => this.props.dispatch({key: 'SCENE', scene: 'home'})}>
            <Text style={styles.closeText}>&#215;</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    flexDirection: 'column',
    height: height,
    width: width,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  doneContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  header: {
    flex: 1,
    padding: 5,
    backgroundColor: '#F7F7F7',
    borderTopColor: '#DEDEDE',
    borderBottomColor: '#DEDEDE',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  headerText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  currentLog: {
    color: red,
  },
  body: {
    flex: 1,
    padding: 8,
    flexDirection: 'row',
  },
  time: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  timeText: {
    fontSize: 13,
    width: 60,
  },
  message: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  messageText: {
    fontSize: 17,
  },
  logsButton: {
    flex: 1,
    width: 44,
    height: 44,
    borderRadius: 44/2,
    backgroundColor: blue,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 30,
  },
  verticalSeparator: {
    width: 2,
    height: 30,
    backgroundColor: '#cccccc',
  },
  lineToggle: {
    backgroundColor: blue,
  },
  logEntryContainer: {
    flex: 1,
    flexDirection: 'column',
  },
});

module.exports = Logs;
