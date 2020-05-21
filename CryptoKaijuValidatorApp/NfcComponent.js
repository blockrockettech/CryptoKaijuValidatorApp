import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';

import KaijuTagParserService from "./services/KaijuTagParserService";

class NfcComponent extends React.Component {

  state = {
    kaiju: null,
  };

  constructor() {
    super();

    this.tagParser = new KaijuTagParserService();
  }

  componentDidMount() {
    NfcManager.start();
    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) =>
      this.onTagScanned(tag),
    );
  }

  componentWillUnmount() {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.unregisterTagEvent().catch(() => 0);
  }

  onTagScanned(tag) {
    NfcManager.setAlertMessageIOS('I got your tag!');
    NfcManager.unregisterTagEvent().catch(() => 0);

    const nfcId = this.tagParser.getNfcID(tag);

    fetch(`https://api.cryptokaiju.io/api/network/1/token/nfc/${nfcId}`, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          kaiju: responseJson,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  verifyBtn() {
    return <TouchableOpacity
    style={{padding: 10, width: 200, margin: 20, borderWidth: 1, borderColor: 'black'}}
    onPress={this._test}
      >
      <Text style={{textAlign: 'center'}}>Verify</Text>
    </TouchableOpacity>;
  }

  result() {
    console.log('k image', this.state.kaiju.ipfsData.image);
    return (
      <>
      <Image
    accessibilityRole={'image'}
    source={require('./assets/black-tick.png')}
    ></Image>
    <Image
    accessibilityRole={'image'}
    source={{uri: this.state.kaiju.ipfsData.image}}
    style={{width: 250, height: 250}}
    ></Image>

      <Text>{this.state.kaiju.ipfsData.name}</Text>
      <Text>{this.state.kaiju.ipfsData.description}</Text>
    </>
    );
  }

  render() {
    return this.state.kaiju ? this.result() : this.verifyBtn();
  }

  _cancel = () => {
    NfcManager.unregisterTagEvent().catch(() => 0);
  };

  _test = async () => {
    try {
      await NfcManager.registerTagEvent();
    } catch (ex) {
      console.warn('ex', ex);
      NfcManager.unregisterTagEvent().catch(() => 0);
    }
  };
}

export default NfcComponent;
