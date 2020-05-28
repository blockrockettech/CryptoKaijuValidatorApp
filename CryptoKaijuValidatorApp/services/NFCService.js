import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';

export default class NFCService {
  start() {
    NfcManager.start();
  }

  async scan() {
    let tag;

    try {
      await NfcManager.requestTechnology(
        [NfcTech.MifareIOS, NfcTech.Iso15693IOS, NfcTech.IsoDep],
        {alertMessage: 'Please scan the bottom of your Kaiju'},
      );

      tag = await NfcManager.getTag();

      this.cleanUp();
    } catch (ex) {
      console.error('ex', ex);
      this.cleanUp();
    }

    return tag;
  }

  async write() {
    try {
      await NfcManager.requestTechnology(
        [NfcTech.MifareIOS, NfcTech.Iso15693IOS, NfcTech.IsoDep],
        {
          alertMessage: 'Ready to write to an NFC tag!',
        },
      );

      let tag = await NfcManager.getTag();
      console.log(tag);

      let text = `NFC ID ${tag.id}`;
      console.log('text to write', text);

      let fullLength = text.length + 7;
      let payloadLength = text.length + 3;

      let cmd = NfcManager.sendMifareCommandIOS;
      let resp = await cmd([0xa2, 0x04, 0x03, fullLength, 0xd1, 0x01]);
      console.log(
        'resp',
        resp.toString() === '10' ? 'Success' : resp.toString(),
      );
      resp = await cmd([0xa2, 0x05, payloadLength, 0x54, 0x02, 0x65]); // T enYourPayload
      console.log(
        'resp',
        resp.toString() === '10' ? 'Success' : resp.toString(),
      );
      let currentPage = 6;
      let currentPayload = [0xa2, currentPage, 0x6e]; // n
      for (let i = 0; i < text.length; i++) {
        currentPayload.push(text.charCodeAt(i));
        if (currentPayload.length == 6) {
          resp = await cmd(currentPayload);
          currentPage += 1;
          currentPayload = [0xa2, currentPage];
        }
      }

      console.log('finished loop');
      currentPayload.push(254);
      while (currentPayload.length < 6) {
        currentPayload.push(0);
      }
      resp = await cmd(currentPayload);
      console.log(
        'resp',
        resp.toString() === '10' ? 'Success' : resp.toString(),
      );

      this.cleanUp();
    } catch (ex) {
      console.warn('ex', ex);
      this.cleanUp();
    }
  }

  cleanUp() {
    NfcManager.setAlertMessageIOS('Processing Kaiju...');
    NfcManager.cancelTechnologyRequest().catch(() => 0);
  }
}
