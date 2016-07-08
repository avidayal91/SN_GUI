var Iguana = (function(Iguana, $, undefined){
	"use strict";

    Iguana._hash = {
        init: SHA256_init,
        update: SHA256_write,
        getBytes: SHA256_finalize
    };

    Iguana.isEnterKey = function (charCode) {
        return (charCode == 10 || charCode == 13);
    }

    Iguana.getTime = function() {
        return Date.now();
    }

    Iguana.blake2bHash = function(messageBytes){
    	return blake2b(messageBytes, null, 32);
    }

    Iguana.keccakHash = function(messageBytes){
    	return keccak_256.array(messageBytes);
    }

    Iguana.hashChain = function(noncedSecretPhraseBytes){
    	return this.keccakHash(this.blake2bHash(new Uint8Array(noncedSecretPhraseBytes)));
    }

    Iguana.appendUint8Arrays = function(array1, array2){
    	var tmp = new Uint8Array(array1.length + array2.length);
    	tmp.set(array1, 0);
    	tmp.set(array2, array1.length);
    	return tmp;
    }

    Iguana.appendNonce = function(originalSeed){
        var nonce = new Uint8Array(converters.int32ToBytes(Iguana.constants.INITIAL_NONCE, true));
        return this.appendUint8Arrays(nonce, originalSeed);
    }
    
    Iguana.buildAccountSeedHash = function(seedBytes){
    	var data = this.appendNonce(seedBytes);
    	var seedHash = this.hashChain(data);
    	var accountSeedHash = SHA256_hash(Array.prototype.slice.call(seedHash), true);

    	return new Uint8Array(accountSeedHash);
    }

    Iguana.buildPublicKey = function (seedBytes) {
        var accountSeedHash = this.buildAccountSeedHash(seedBytes);
        var p = curve25519.generateKeyPair(accountSeedHash.buffer);

        return Base58.encode(new Uint8Array(p.public));
    }

    Iguana.buildPrivateKey = function (seedBytes) {
        var accountSeedHash = this.buildAccountSeedHash(seedBytes);
        var p = curve25519.generateKeyPair(accountSeedHash.buffer);

        return Base58.encode(new Uint8Array(p.private));
    }

    //Returns publicKey built from string
    Iguana.getPublicKey = function(secretPhrase) {
        return this.buildPublicKey(converters.stringToByteArray(secretPhrase));
    }

    //Returns privateKey built from string
    Iguana.getPrivateKey = function(secretPhrase) {
        return this.buildPrivateKey(converters.stringToByteArray(secretPhrase));
    }


    Iguana.encryptWalletSeed = function (phrase, key) {
        var rkey = Iguana.prepKey(key);
        return CryptoJS.AES.encrypt(phrase, rkey);
    }

    Iguana.decryptWalletSeed = function (cipher, key, checksum) {
        var rkey = Iguana.prepKey(key);
        var data = CryptoJS.AES.decrypt(cipher, rkey);

        if (converters.byteArrayToHexString(Iguana.simpleHash(converters.hexStringToByteArray(data.toString()))) == checksum)
            return converters.hexStringToString(data.toString());
        else return false;
    }

    Iguana.prepKey = function (key) {
        var rounds = 1000;
        var digest = key;
        for (var i = 0; i < rounds; i++) {
            digest = converters.byteArrayToHexString(Iguana.simpleHash(digest));
        }
        return digest;
    }

    Iguana.simpleHash = function (message) {
        Iguana._hash.init();
        Iguana._hash.update(message);
        return Iguana._hash.getBytes();
    }

    return Iguana;

}(Iguana || {}, jQuery));