import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Button,
  Linking,
} from 'react-native';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';

import KaijuTagParserService from './services/KaijuTagParserService';
import KaijuApiService from "./services/KaijuApiService";

class NfcComponent extends React.Component {
  state = {
    kaiju: null,
  };

  constructor() {
    super();

    this.tagParser = new KaijuTagParserService();
    this.api = new KaijuApiService();
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

  async onTagScanned(tag) {
    NfcManager.setAlertMessageIOS('I got your tag!');
    NfcManager.unregisterTagEvent().catch(() => 0);

    const nfcId = this.tagParser.getNfcID(tag);
    const kaiju = await this.api.getKaijuByNfcID(nfcId);
    this.setState({
      kaiju,
    });
  }

  verifyBtn() {
    return (
      <TouchableOpacity
        style={{
          padding: 10,
          width: 200,
          margin: 20,
          borderWidth: 1,
          borderColor: 'black',
        }}
        onPress={this._scanNfc}>
        <Text style={{textAlign: 'center'}}>Verify</Text>
      </TouchableOpacity>
    );
  }

  result() {
    console.log(this.state.kaiju);
    return (
      <>
        <Image
          accessibilityRole={'image'}
          source={require('./assets/black-tick.png')}
        />
        <Image
          accessibilityRole={'image'}
          source={{uri: this.state.kaiju.ipfsData.image}}
          style={{width: 250, height: 250}}
        />

        <Text>{this.state.kaiju.ipfsData.name}</Text>
        <Text>{this.state.kaiju.ipfsData.description}</Text>
        <Text>Owner: {this.state.kaiju.owner}</Text>
        <Button
          title={'View on OpenSea'}
          onPress={() =>
            Linking.openURL(
              `https://opensea.io/assets/0x102c527714ab7e652630cac7a30abb482b041fd0/${this.state.kaiju.tokenId}`,
            )
          }
        />
      </>
    );
  }

  render() {
    return this.state.kaiju ? this.result() : this.verifyBtn();
  }

  _cancel = () => {
    NfcManager.unregisterTagEvent().catch(() => 0);
  };

  _scanNfc = async () => {
    try {
      await NfcManager.registerTagEvent();
    } catch (ex) {
      console.warn('ex', ex);
      NfcManager.unregisterTagEvent().catch(() => 0);
    }
  };
}

export default NfcComponent;
