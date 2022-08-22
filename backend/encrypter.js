class Encrypter{
    constructor(){}

    hashKeySha1(text){
        return CryptoJS.SHA1(text).toString(CryptoJS.enc.Base64)
    }

    encryptWithAES(text, passphrase){
        return CryptoJS.AES.encrypt(text, passphrase).toString();
      };
      
    decryptWithAES(ciphertext, passphrase){
        const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
      }
}
