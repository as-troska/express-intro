//Importerer pakkene vi skal bruke
const express = require('express');
const path = require('path');
const db = require("better-sqlite3")("datbase.db");

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
    //Kjører SQL-setningen. Verdiene fra skjemaet settes inn på plassene til spørsmålstegnene.
    stmt.run(req.body.fornavn, req.body.etternavn, req.body.fdato, req.body.epost, req.body.brukernavn, req.body.passord);
    //Sender brukeren til velkommen.html
    res.sendFile(path.join(__dirname, "public", "velkommen.html"))
});

app.post("/login", (req, res) => {
    //Lager en SQL-setning som henter ut data fra databasen når den kjøres. Spørsmålstegnene representerer verdier som skal hentes ut.
    const stmt = db.prepare("SELECT * FROM user WHERE brukernavn = ?");
    //Kjører SQL-setningen. Verdiene fra skjemaet settes inn på plassene til spørsmålstegnene. Det lagres et objekt med all informasjonen i variabelen user.
    const user = stmt.get(req.body.brukernavn);
    
    //Sjekker om brukeren finnes
    if (user && user.passord === req.body.passord) {
        //Sender brukeren til velkommen.html
        res.sendFile(path.join(__dirname, "public", "velkommen.html"))
    } else {
        //Sender brukeren til feil.html
        res.sendFile(path.join(__dirname, "public", "feil.html"))
    }
});

//Starter sørveren på port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
})