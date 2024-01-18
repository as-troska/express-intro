//Importerer pakkene vi skal bruke
const express = require('express');
const path = require('path');
const db = require("better-sqlite3")("datbase.db");
const bcrypt = require("bcrypt");

//Lager en instans av Express i variabelen app
const app = express();

//Setter opp en mappe for statiske filer
app.use(express.static(path.join(__dirname, "public")));

//Gjør at vi kan lese data fra et skjema som sendes inn via POST
app.use(express.urlencoded({ extended: false }));

//Setter opp en rute som kan ta imot et skjema som sendes inn via POST
app.post("/registrer", (req, res) => {
    //Lager en SQL-setning som setter inn data i databasen når den kjøres. Spørsmålstegnene representerer verdier som skal settes inn.
    const stmt = db.prepare("INSERT INTO user (fornavn, etternavn, fdato, epost, brukernavn, passord) VALUES (?, ?, ?, ?, ?, ?)");
    //Hasher passordet som er sendt inn via skjemaet
    const hash = bcrypt.hashSync(req.body.passord, 10);    
    //Kjører SQL-setningen. Verdiene fra skjemaet settes inn på plassene til spørsmålstegnene.
    stmt.run(req.body.fornavn, req.body.etternavn, req.body.fdato, req.body.epost, req.body.brukernavn, hash);
    //Sender brukeren til velkommen.html
    res.sendFile(path.join(__dirname, "public", "velkommen.html"))
});

app.post("/login", (req, res) => {
    //Lager en SQL-setning som henter ut data fra databasen når den kjøres. Spørsmålstegnene representerer verdier som skal hentes ut.
    const stmt = db.prepare("SELECT * FROM user WHERE brukernavn = ?");
    //Kjører SQL-setningen. Verdiene fra skjemaet settes inn på plassene til spørsmålstegnene. Det lagres et objekt med all informasjonen i variabelen user.
    const user = stmt.get(req.body.brukernavn);

    console.log(user)
    

    //Sjekker om brukeren finnes og sjekker deretter om hash av passordetm som er sendt inn matcher hashen lagret i databasen
    if (user && bcrypt.compareSync(req.body.passord, user.passord)) {
        //Sender brukeren til velkommen.html om brukeren finnes og passordet er riktig
        res.sendFile(path.join(__dirname, "public", "velkommen.html"))
    } else {
        //Sender brukeren til feil.html om ikke brukeren finnes eller passordet er feil
        res.sendFile(path.join(__dirname, "public", "feil.html"))
    }
});

//En rute som henter ut alle brukere fra databasen og sender dem tilbake som JSON
app.get("/brukere", (req, res) => { 
    //Merk at denne ruten bør sikres på ett eller annet tidspunkt. Om ikke kan alle hente ut all brukerdata når som helst.
    const stmt = db.prepare("SELECT * FROM user");
    const users = stmt.all();
    res.json(users)
});

//En rute for å oppdatere en bruker
app.post("/oppdatere", (req, res) => {
    // UPDATE stamtment har syntkasen UPDATE tabell SET kolonne = verdi, kontonne = verdi WHERE kolonne = verdi
    const stmt = db.prepare("UPDATE user SET fornavn = ?, etternavn = ?, fdato = ?, epost = ?, brukernavn = ? WHERE id = ?");
    stmt.run(req.body.fornavn, req.body.etternavn, req.body.fdato, req.body.epost, req.body.brukernavn, req.body.id);
    //Sender brukeren tilbake til siden de kom fra, dvs skjemaet de var på.
    res.redirect("back");
})

//Starter sørveren på port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
})