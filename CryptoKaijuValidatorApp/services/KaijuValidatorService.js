export default class KaijuValidatorService {
  // the nfc ID needs to be from the chip itself and not the
  async validate(api, nfcIdFromChip, nfcIdFromText, kittyId) {
    let kaiju = null;
    let isValid = true;

    try {
      kaiju = await api.getKaijuByNfcID(nfcIdFromChip);
    } catch (e) {
      console.log('Invalid NFC ID');
    }

    // If a kitty kaiju, validate it
    let isKittyValid = true;
    if (kaiju !== null && kittyId !== '') {
      const external_kitty_uri = kaiju.ipfsData.external_kitty_uri;
      if (!external_kitty_uri) {
        isKittyValid = false;
      } else {
        const external_kitty_uriSplit = external_kitty_uri.split('/');
        const kittyIdFromKaijuData =
          external_kitty_uriSplit[external_kitty_uriSplit.length - 1];
        isKittyValid = kittyIdFromKaijuData === kittyId;
      }
    }

    isValid =
      kaiju !== null
        ? nfcIdFromChip === kaiju.nfcId && nfcIdFromChip === nfcIdFromText && isKittyValid
        : false;

    return {
      isValid,
      kaiju,
    };
  }
}
