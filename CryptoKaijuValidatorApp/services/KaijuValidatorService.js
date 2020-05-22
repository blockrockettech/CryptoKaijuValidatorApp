export default class KaijuValidatorService {
  // the nfc ID needs to be from the chip itself and not the
  async validate(api, nfcIdFromChip, nfcIdFromText) {
    let kaiju = null;
    let isValid = true;

    try {
      kaiju = await api.getKaijuByNfcID(nfcIdFromChip);
    } catch (e) {
      isValid = false;
    }

    isValid =
      kaiju !== null
        ? nfcIdFromChip === kaiju.nfcId && nfcIdFromChip === nfcIdFromText
        : false;

    return {
      isValid,
      kaiju,
    };
  }
}
