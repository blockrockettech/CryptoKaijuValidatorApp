import React from 'react';
import {
  Text,
  TouchableOpacity,
  Image,
  Button,
  Linking,
  StyleSheet,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import NFCService from './services/NFCService';
import KaijuTagParserService from './services/KaijuTagParserService';
import KaijuApiService from './services/KaijuApiService';
import KaijuValidatorService from './services/KaijuValidatorService';

const styles = StyleSheet.create({
  viewbox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    padding: 50,
  },
});

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
    this.nfcService = new NFCService();
  }

  componentDidMount() {
    this.nfcService.start();

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({
        kaiju: null,
        isValid: false,
        scanned: false,
      });
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  async onTagReceived(tag) {
    console.log('onTagReceived', tag);
    const nfcIdFromChip = tag.id;
    const nfcIdFromText = this.tagParser.getNfcIDFromText(tag);

    // If we have scanned a kitty kaiju, so try to get its token ID
    const kittyId = this.tagParser.getKittyIDFromText(tag);

    const {kaiju, isValid} = await this.validator.validate(
      this.api,
      nfcIdFromChip,
      nfcIdFromText,
      kittyId,
    );

    this.setState({
      kaiju,
      isValid,
      nfcIdFromChip,
      scanned: true,
    });
  }

  verifyBtn() {
    return (
      <SafeAreaView style={styles.viewbox}>
        <TouchableOpacity
          style={{
            padding: 10,
            width: 200,
            margin: 20,
            borderWidth: 1,
            borderColor: 'black',
          }}
          onPress={this._scanNfc}>
          <Text style={{textAlign: 'center'}}>Start Scanning</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  validResult() {
    return (
      <SafeAreaView style={styles.viewbox}>
        <Image
          accessibilityRole={'image'}
          source={require('./assets/green-tick.png')}
          style={{width: 100, height: 100}}
        />

        <Image
          accessibilityRole={'image'}
          source={{uri: this.state.kaiju.ipfsData.image}}
          style={{width: 250, height: 250, resizeMode: 'contain'}}
        />

        <Text style={{marginBottom: 10, fontWeight: 'bold'}}>
          {this.state.kaiju.ipfsData.name}
        </Text>
        <Text style={{marginBottom: 10}}>
          {this.state.kaiju.ipfsData.description}
        </Text>
        <Text style={{marginBottom: 10}}>
          <Text style={{marginBottom: 5}}>Chip ID</Text>
          <Text style={{marginBottom: 10}}>{this.state.nfcIdFromChip}</Text>
        </Text>
        <Text style={{marginBottom: 10}}>
          <Text style={{marginBottom: 5}}>Current owner</Text>
          <Text style={{marginBottom: 10}}>{this.state.kaiju.owner}</Text>
        </Text>
        <Button
          title={'View on OpenSea'}
          style={{width: 'auto'}}
          onPress={() =>
            Linking.openURL(
              `https://opensea.io/assets/0x102c527714ab7e652630cac7a30abb482b041fd0/${this.state.kaiju.tokenId}`,
            )
          }
        />
      </SafeAreaView>
    );
  }

  invalidResult() {
    return (
      <SafeAreaView style={styles.viewbox}>
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
      </SafeAreaView>
    );
  }

  result() {
    return this.state.isValid ? this.validResult() : this.invalidResult();
  }

  render() {
    return this.state.scanned ? this.result() : this.verifyBtn();
  }

  _scanNfc = async () => {
    console.log('Scanning chip');
    const tag = await this.nfcService.scan();

    console.log('Chip scanned, tag', tag);
    await this.onTagReceived(tag);
  };
}

export default NfcComponent;
