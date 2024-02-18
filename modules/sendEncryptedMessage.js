const conn = require("../db");
const crypto = require("crypto");
const Main = require("../securityTest/test");

function encryptMessage(publicKey, message) {
    return crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDINGi
    }, Buffer.from(message, 'utf-8'));
}
const sifrelenmisOzelAnahtar = crypto.createHash('sha256').update("BuOzelBirAnahtardirProjeyeOzel").digest('hex');
function decryptMessage(privateKey, encryptedMessage) {
    const decryptedBuffer = crypto.privateDecrypt({
        key: privateKey,
        passphrase: sifrelenmisOzelAnahtar
    }, encryptedMessage);
    return decryptedBuffer.toString('utf-8');
}
let encryptedMessage;
function mesajGonderVeCozmeyiDene(email, message, res, req) {
    conn.query("SELECT publicKey FROM users WHERE email = ?", [email], (err, results) => {
        if (err) {
            return console.error("Genel anahtar ve özel anahtar çekilirken hata oluştu: " + err);
        }

        if (results.length === 0) {
            return console.error("Bu kullanıcı bulunamadı.");
        }

        const publicKey = results[0].publicKey;
        const privateKey = results[0].publicKey;

        encryptedMessage = encryptMessage(publicKey, message);
        console.log(`Mesaj sadece ${email} kullanıcısının çözebileceği şekilde şifrelendi: ${encryptedMessage}`);
        console.log("Çerezde özel anahtar: ", req.cookies.privateKey);
        try {
            const decryptedMessage = decryptMessage(req.cookies.privateKey, encryptedMessage);
            console.log(`${email} kullanıcısı kendisine özel şifrelenmiş mesajı çözmeyi denedi. Çözülmüş mesaj: ${decryptedMessage}`);
            Main(encryptedMessage, req);
        }
        catch (err) {
            console.log(`${req.cookies.email} kullanıcısı özel şifrelenmiş bir mesajı çözmeyi denedi ancak çözülemedi: Alıcı değilsiniz veya şifreleme algoritmanızda bir hata var.`);
            console.error(err);
        }
    });
}

module.exports = { mesajGonderVeCozmeyiDene, encryptedMessage };