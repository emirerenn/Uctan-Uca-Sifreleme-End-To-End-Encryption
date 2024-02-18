const crypto = require("crypto");
const sifrelenmisOzelAnahtar = crypto.createHash('sha256').update("BuOzelBirAnahtardirProjeyeOzel").digest('hex');
function CreateKey() {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
            cipher: 'aes-256-cbc', 
            passphrase: sifrelenmisOzelAnahtar
        }
    });
}

module.exports = CreateKey;