import React from 'react';
import {
  View, Text, TouchableOpacity
} from 'react-native';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';

class NfcComponent extends React.Component {

  state = {
    tagType: '',
    tagData: '',
    tagPayloadType: '',
    tagId: ''
  };

  componentDidMount() {
    NfcManager.start();
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      console.debug('Raw TAG', JSON.stringify(tag));
      let decodedPayload = tag.ndefMessage[0].payload.map(b => String.fromCharCode(b)).join('');
      let decodedPayloadType = tag.ndefMessage[0].type.map(b => String.fromCharCode(b)).join('');
      let tagType = tag.type;
      console.debug(`Decoded DATA [${decodedPayload}]`);
      NfcManager.setAlertMessageIOS('I got your tag!');
      NfcManager.unregisterTagEvent().catch(() => 0);

      // Remove `en` encoding from raw string
      if (decodedPayload.indexOf('en') === 1) {
        decodedPayload = decodedPayload.slice(3, decodedPayload.length - 1);
      }

      this.setState({
        tagData: decodedPayload,
        tagType: tagType,
        tagPayloadType: decodedPayloadType,
        tagId: tag.id
      });
    });
  }

  componentWillUnmount() {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.unregisterTagEvent().catch(() => 0);
  }

  render() {
    return (
      <View style={{padding: 20}}>
        <Text>NFC Demo</Text>
        <TouchableOpacity
          style={{padding: 10, width: 200, margin: 20, borderWidth: 1, borderColor: 'black'}}
          onPress={this._test}
        >
          <Text> -- Scan -- </Text>
        </TouchableOpacity>

        <Text>Tag Data</Text>
        <Text>{this.state.tagData}</Text>
        <Text>-----------</Text>
        <Text>Tag ID</Text>
        <Text>{this.state.tagId}</Text>
        <Text>-----------</Text>
        <Text>Tag Data Type</Text>
        <Text>{this.state.tagPayloadType}</Text>
        <Text>-----------</Text>
        <Text>Tag Type</Text>
        <Text>{this.state.tagType}</Text>
      </View>
    );
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
