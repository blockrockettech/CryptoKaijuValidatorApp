import axios from 'axios';

export default class KaijuApiService {
  constructor() {
    this.baseUrl = 'https://api.cryptokaiju.io/api/network/1/';
  }

  async getKaijuByNfcID(nfcId) {
    return (await axios.get(`${this.baseUrl}/token/nfc/${nfcId}`)).data;
  }
}
