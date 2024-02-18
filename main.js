const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
app.use(cors());
require("dotenv").config();
const conn = require("./db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "src")));
app.use(bodyParser.json());
const CreateKey = require("./modules/createKeys");
const crypto = require("crypto");
const { Register, Login } = require("./modules/authentication");
const { mesajGonderVeCozmeyiDene } = require("./modules/sendEncryptedMessage");
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "giris.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "kayit.html"));
});
app.get("/", (req, res) => {
    if (req.cookies && req.cookies.email !== undefined && req.cookies.email !== "") {
        Login(req.cookies.email, req.cookies.password, res)
            .then((result) => {
                if (result.status == "ok") {
                    mesajGonderVeCozmeyiDene("eemirrbusiness@gmail.com", "Merhaba emir, nasılsın?", res, req);
                    res.sendFile(path.join(__dirname, "src", "anasayfa.html"));
                } else {
                    console.log(result.email + result.password);
                    res.redirect("/login");
                }
            })
            .catch((err) => {
                console.error(err);
                res.send("Bir hata oluştu");
            });
    }
    else {
        console.log("çerez bulunmadı veya email undefined veya email değeri boş: " + req.cookies.email);
        res.redirect("/login");
    }
});

app.post("/register", (req, res) => {
    Register(req.body.email, req.body.password, res);
});

app.post("/login", (req, res) => {
    Login(req.body.email, req.body.password, res)
        .then((result) => {
            return res.json(result);
        })
        .catch((err) => {
            console.error(err);
        });
});

app.listen(process.env.PORT, () => console.log("Server running"));