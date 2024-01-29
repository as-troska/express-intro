//Importerer pakkene vi skal bruke
const express = require('express');
const path = require('path');
const db = require("better-sqlite3")("database.db", {verbose: console.log});
const bcrypt = require("bcrypt");
const session = require("express-session");
const fileUpload = require("express-fileupload")
const fs = require("fs")
const ruter = require("./ruter")

//Lager en instans av Express i variabelen app
const app = express();


//Setter opp en mappe for statiske filer
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload())

//Gjør at vi kan lese data fra et skjema som sendes inn via POST
app.use(express.urlencoded({ extended: false }));

//Setter opp sessions
app.use(session({
    secret: "secretSomBørLagresIEnMiljøvariabel",
    resave: false,
    saveUninitialized: false
}));

app.post("/registrer", ruter.registrer);
app.post("/login", ruter.login);
app.get("/brukere", sjekkAdmin, ruter.brukere);
app.post("/oppdatere", sjekkAdmin, ruter.oppdatere)
app.get("/admin", sjekkAdmin, ruter.admin)
app.get("/login", ruter.loginaction)

app.get("/", (req, res) => {
    res.redirect("/login")  
})

app.get("/slett/:id", sjekkAdmin, (req, res) => {
    // DELETE stamtment har syntaksen DELETE FROM tabell WHERE kolonne = verdi
    const stmt = db.prepare("DELETE FROM user WHERE id = ?");
    stmt.run(req.params.id);
    //Sender brukeren tilbake til siden de kom fra, dvs skjemaet de var på.
    res.redirect("back")
})

//Starter sørveren på port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
})

app.get("/loggut", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
})

app.get("/nyttBilde", sjekkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "nyttBilde.html"))
})

app.post("/lastOpp", sjekkLogin, (req, res) => {    
    const filetypes = ["image/jpg", "image/png", "image/gif", "image/jpeg"]
    
    if(!req.files) {
        return res.sendStatus(400)
    }

    if(filetypes.includes(req.files.bilde.mimetype)) {
        req.files.bilde.mv(__dirname + "/public/img/" + req.files.bilde.name)
        console.log("File uploaded: " + req.files.bilde.name)
        const stmt = db.prepare("INSERT INTO photos (url, caption, user_id) VALUES (?, ?, ?)")
        stmt.run("public/img/" + req.files.bilde.name, req.body.caption, req.session.userid)
        return res.sendStatus(200)        
    } else {
        return res.sendStatus(415)
    }

});

app.get("/bilder", sjekkLogin, (req, res) => {
    const stmt = db.prepare("SELECT * FROM photos")
    const photos = stmt.all()
    res.json(photos)   
})

app.get("/alleBilder", sjekkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "bilder.html"))
})


//En middleware som sjekker om brukeren er logget inn. Om ikke sender den brukeren til innloggingssiden.
function sjekkLogin(req, res, next) {
    if (req.session.loggetInn) {
        next();
    } else {
        res.redirect("/login");
    }
}

function sjekkAdmin(req, res, next) {
    if (req.session.admin) {
        next();
    } else {
        res.redirect("/login");
    }
}
