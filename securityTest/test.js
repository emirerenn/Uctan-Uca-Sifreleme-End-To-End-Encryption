const crypto = require("crypto");
const conn = require("../db");

function Encrypt(message, publicKey){
    return crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(message, 'utf-8'));
}
const sifrelenmisOzelAnahtar = crypto.createHash('sha256').update("BuOzelBirAnahtardirProjeyeOzel").digest('hex');
function Decrypt(message, privateKey) {
    const decryptedBuffer = crypto.privateDecrypt({
        key: privateKey,
        passphrase: sifrelenmisOzelAnahtar
    }, message);
    return decryptedBuffer.toString('utf-8');
}

function Main(encryptedMessage, req)
{
    console.log("Şifrelenmiş mesaj buymuş: " + encryptedMessage);

    conn.query("SELECT privateKey FROM users WHERE email = ?", [req.cookies.email], (err, results) => {
        if (err)
        {
            return console.error("Özel anahtar alınırken sorun çıktı: " + err);
        }

        if (results.length === 0)
        {
            return console.error("Hiçbir kullanıcı bulunamadı.");
        }

        const user = results[0];

        const privateKey = user.privateKey;
        console.log("Sizin özel anahtarınız: " + privateKey);

        const decryptedMessage = Decrypt(encryptedMessage, privateKey);
        console.log("Mesaj çözülme denendi: " + decryptedMessage);
    });
}

module.exports = Main;