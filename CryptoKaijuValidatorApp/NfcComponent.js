import React from 'react';
import {
  Text,
  TouchableOpacity,
  Image,
  Button,
  Linking,
} from 'react-native';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';

import KaijuTagParserService from './services/KaijuTagParserService';
import KaijuApiService from './services/KaijuApiService';
import KaijuValidatorService from './services/KaijuValidatorService';

class NfcComponent extends React.Component {
  state = {
    kaiju: null,
    isValid: true,
    scanned: false,
    scanning: false,
  };

  constructor() {
    super();

    this.tagParser = new KaijuTagParserService();
    this.api = new KaijuApiService();
    this.validator = new KaijuValidatorService();
  }

  componentDidMount() {
    NfcManager.start();
  }

  componentWillUnmount() {
    NfcManager.cancelTechnologyRequest().catch(() => 0);
  }

  async onTagReceived(tag) {
    NfcManager.setAlertMessageIOS('I got your tag!');
    NfcManager.unregisterTagEvent().catch(() => 0);

    const nfcIdFromChip = tag.id;
    const nfcIdFromText = this.tagParser.getNfcIDFromText(tag);
    const {kaiju, isValid} = await this.validator.validate(
      this.api,
      nfcIdFromChip,
      nfcIdFromText,
    );

    this.setState({
      kaiju,
      isValid,
      scanned: true,
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

  validResult() {
    return (
      <>
        <Image
          accessibilityRole={'image'}
          source={require('./assets/black-tick.png')}
          style={{width: 100, height: 100}}
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

  invalidResult() {
    return (
      <>
        <Image
          accessibilityRole={'image'}
          source={require('./assets/red-cross.png')}
          style={{width: 100, height: 100}}
        />
        <Image
          accessibilityRole={'image'}
          source={require('./assets/green-kaiju.png')}
        />
        <Text style={{color: 'red'}}>That Kaiju is invalid</Text>
        <TouchableOpacity
          style={{
            padding: 10,
            width: 200,
            margin: 20,
            borderWidth: 1,
            borderColor: 'black',
          }}>
          <Text style={{textAlign: 'center'}}>Report</Text>
        </TouchableOpacity>
      </>
    );
  }

  result() {
    return this.state.isValid ? this.validResult() : this.invalidResult();
  }

  render() {
    return this.state.scanned ? this.result() : this.verifyBtn();
  }

  _scanNfc = async () => {
    try {
      await NfcManager.requestTechnology([
        NfcTech.MifareIOS,
        NfcTech.Iso15693IOS,
        NfcTech.IsoDep,
      ]);

      let tag = await NfcManager.getTag();

      this.onTagReceived(tag);

      NfcManager.cancelTechnologyRequest().catch(() => 0);
    } catch (ex) {
      console.error('ex', ex);
      NfcManager.cancelTechnologyRequest().catch(() => 0);
    }
  };
}

export default NfcComponent;
