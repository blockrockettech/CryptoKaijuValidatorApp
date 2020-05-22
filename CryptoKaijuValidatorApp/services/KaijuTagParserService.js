const zeroCharCode = 48;
const nineCharCode = 57;
const upperACharCode = 65;
const upperZCharCode = 90;
const lowerACharCode = 97;
const lowerZCharCode = 122;
const spaceCharCode = 32;
const newLineCharCode = 10;

export default class KaijuTagParserService {
  getText(tag) {
    if (!tag || !tag.ndefMessage[0]) {
      return '';
    }

    // Get the tag's text but only the 0-9, A-Z, a-z characters
    const ndefMessage = tag.ndefMessage[0];
    let decodedText = ndefMessage.payload
      .filter((charCode) => (charCode >= zeroCharCode && charCode <= nineCharCode) || (charCode >= upperACharCode && charCode <= upperZCharCode || (charCode >= lowerACharCode && charCode <= lowerZCharCode) || charCode === spaceCharCode || charCode === newLineCharCode))
      .map((charCode) => charCode === newLineCharCode ? ' ' : String.fromCharCode(charCode))
      .join('');

    // drop 'en' from the start of the string if needed (it's not part of the text)
    if (decodedText.indexOf('en') === 0) {
      decodedText = decodedText.slice(2, decodedText.length - 1);
    }

    return decodedText;
  }

  getNfcIDFromText(tag) {
    const decodedText = this.getText(tag);
    const decodedTextSplitBySpaces = decodedText.split(' ');

    let nfcId = '';
    decodedTextSplitBySpaces.forEach((part, index) => {
      // Ensure the lookahead does not cause an out of bounds
      if (part === 'NFC' && index + 2 < decodedTextSplitBySpaces.length) {
        nfcId = decodedTextSplitBySpaces[index + 2];
      }
    });

    return nfcId;
  }
}
