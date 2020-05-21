export default class KaijuTagParserService {
  getText(tag) {
    if (!tag || !tag.ndefMessage[0]) {
      return '';
    }

    // Get the tag's text but only the 0-9, A-Z, a-z characters
    const ndefMessage = tag.ndefMessage[0];
    let decodedText = ndefMessage.payload
      .filter((charCode) => (charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90 || (charCode >= 97 && charCode <= 122) || charCode === 32 || charCode === 10))
      .map((charCode) => charCode === 10 ? ' ' : String.fromCharCode(charCode))
      .join('');

    if (decodedText.indexOf('en') === 0) {
      decodedText = decodedText.slice(2, decodedText.length - 1);
    }

    console.log('tag text', decodedText);

    return decodedText;
  }

  getNfcID(tag) {
    const decodedText = this.getText(tag);
    const decodedTextSplitBySpaces = decodedText.split(' ');

    if (decodedTextSplitBySpaces[0] === 'NFC' && decodedTextSplitBySpaces[1] === 'ID') {
      return decodedTextSplitBySpaces[2];
    }

    return '';
  }
}
