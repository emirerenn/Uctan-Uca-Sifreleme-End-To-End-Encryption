const crypto = require('crypto');
const conn = require("./db");

conn.connect((err) => {
	if (err) {
		return console.error("Veritabanı bağlantısı başarısız: " + err);
	}
	console.log("Veritabanı Bağlantısı Başarılı!");


	// Anahtar çiftlerini oluşturma fonksiyonu
	function generateKeyPair() {
		return crypto.generateKeyPairSync('rsa', {
			modulusLength: 2048, // Anahtar uzunluğu
			publicKeyEncoding: {
				type: 'pkcs1', // Public key encoding tipi
				format: 'pem'   // Public key formatı
			},
			privateKeyEncoding: {
				type: 'pkcs1', // Private key encoding tipi
				format: 'pem'  // Private key formatı
			}
		});
	}

	// Mesajı şifreleme fonksiyonu
	function encryptMessage(publicKey, message) {
		const buffer = Buffer.from(message, 'utf-8');
		return crypto.publicEncrypt(publicKey, buffer);
	}

	// Şifreli mesajı çözme fonksiyonu
	function decryptMessage(privateKey, encryptedMessage) {
		const decryptedBuffer = crypto.privateDecrypt({
			key: privateKey,
			passphrase: '' // Parola yok
		}, encryptedMessage);
		return decryptedBuffer.toString('utf-8');
	}

	// Anahtar çiftlerini oluştur
	const bobKeys = generateKeyPair();
	const aliceKeys = generateKeyPair();

	// Bob'un mesajı
	const bobMessage = 'Merhaba Alice, bu şifreli bir mesajdır.';

	// Bob mesajı Alice'e şifreler
	const encryptedMessageForAlice = encryptMessage(aliceKeys.publicKey, bobMessage);
	// Alice mesajı çözer
	const decryptedMessageByAlice = decryptMessage(aliceKeys.privateKey, encryptedMessageForAlice);

	console.log("Alice Private Key: " + aliceKeys.privateKey + "\n\n");
	console.log("Alice Public Key: " + aliceKeys.publicKey + "\n\n");
	console.log("Alice'e Gelen Şifreli Mesaj: " + encryptedMessageForAlice + "\n\n");
	console.log("Alice'nin Çözdüğü Mesaj: " + decryptedMessageByAlice + "\n\n");

	conn.query("INSERT INTO users (name, publicKey, privateKey) VALUES (?, ?, ?)", ["Alice", aliceKeys.publicKey, aliceKeys.privateKey], (err, results) => {
		if (err) {
			return console.error("Veritabanına kayıt eklenirken bir hata oluştu: " + err);
		}

		if (results.insertId) {
			console.log("Kayıt başarıyla yapıldı.");
		}
	});

});