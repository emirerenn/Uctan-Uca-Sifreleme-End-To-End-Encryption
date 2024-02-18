const crypto = require("crypto");
const conn = require("../db");
const CreateKey = require("./createKeys");
function Login(email, password, res) {
    return new Promise((resolve, reject) => {
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        conn.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
            if (err) {
                reject("Giriş sırasında hata oluştu: " + err);
            }
            if (results.length > 0) {
                const user = results[0];
                if (user.password == hashedPassword) {
                    res.cookie("email", email, { maxAge: 1000 * 60 * 60 * 24 * 365 * 10, httpOnly: true });
                    res.cookie("password", password, { maxAge: 1000 * 60 * 60 * 24 * 365 * 10, httpOnly: true });
                    res.cookie("publicKey", user.publicKey, { maxAge: 1000 * 60 * 60 * 24 * 365 * 10, httpOnly: true });
                    res.cookie("privateKey", user.privateKey, { maxAge: 1000 * 60 * 60 * 24 * 365 * 10, httpOnly: true });
                    resolve({ message: "Giriş başarılı, hoş geldiniz!", status: "ok" });
                } else {
                    resolve({ message: "E-posta veya parola yanlış, tekrar deneyin.", status: "err", email: email, password: password });
                }
            } else {
                resolve({ message: "E-posta veya parola yanlış, tekrar deneyin.", status: "err" });
            }
        });
    });
}


function Register(email, password, res) {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const newKeys = CreateKey();
    conn.query("INSERT INTO users (email, password, publicKey, privateKey) VALUES (?, ?, ?, ?)", [email, hashedPassword, newKeys.publicKey, newKeys.privateKey], (err, results) => {
        if (err) {
            return console.error("Veritabanı kayıt sırasında hata oluştu: " + err);
        }

        if (results.insertId) {
            console.log("Kullanıcı kaydı başarılı!");
            return res.json({ message: "Kaydınız başarılı!", status: "ok" });
        }
    });
}

module.exports = { Login, Register };