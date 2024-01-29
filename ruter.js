const path = require('path');
const db = require("better-sqlite3")("database.db");
const bcrypt = require("bcrypt");
const session = require("express-session");
const fileUpload = require("express-fileupload")
const fs = require("fs")

//Setter opp en rute som kan ta imot et registreringsskjema som sendes inn via POST
async function registrer(req, res) {
        //Lager en SQL-setning som setter inn data i databasen når den kjøres. Spørsmålstegnene representerer verdier som skal settes inn.
        const stmt = db.prepare("INSERT INTO user (fornavn, etternavn, fdato, epost, brukernavn, passord) VALUES (?, ?, ?, ?, ?, ?)");
        //Hasher passordet som er sendt inn via skjemaet
        const hash = bcrypt.hashSync(req.body.passord, 10);    
        //Kjører SQL-setningen. Verdiene fra skjemaet settes inn på plassene til spørsmålstegnene.
        stmt.run(req.body.fornavn, req.body.etternavn, req.body.fdato, req.body.epost, req.body.brukernavn, hash);
        //Sender brukeren til velkommen.html
        res.sendFile(path.join(__dirname, "private", "velkommen.html"))
}

//Setter opp en rute som tar i mot login-skjemaet og logger inn brukeren om den finnes i databasen
async function login(req, res) {
        {
                //Lager en SQL-setning som henter ut data fra databasen når den kjøres. Spørsmålstegnene representerer verdier som skal hentes ut.
                const stmt = db.prepare("SELECT * FROM user WHERE brukernavn = ?");
                //Kjører SQL-setningen. Verdiene fra skjemaet settes inn på plassene til spørsmålstegnene. Det lagres et objekt med all informasjonen i variabelen user.
                const user = stmt.get(req.body.brukernavn);  
                  
            
                //Sjekker om brukeren finnes og sjekker deretter om hash av passordetm som er sendt inn matcher hashen lagret i databasen
                if (user && bcrypt.compareSync(req.body.passord, user.passord)) {
                    //Lagrer brukerinformasjonen i session
                    req.session.loggetInn = true;
                    req.session.brukernavn = user.brukernavn;
                    req.session.fornavn = user.fornavn;
                    req.session.etternavn = user.etternavn;
                    req.session.epost = user.epost;
                    req.session.fdato = user.fdato;
                    req.session.userid = user.id;
            
                    if (user.id === 1) {
                        req.session.admin = true;
                    }
            
                    //Sender brukeren til velkommen.html om brukeren finnes og passordet er riktig
                    res.cookie("brukernavn", user.brukernavn)
                    res.cookie("fornavn", user.fornavn)
                    res.cookie("etternavn", user.etternavn)
                    res.cookie("epost", user.epost)
                    res.cookie("fdato", user.fdato)
                    res.cookie("userid", user.id)
                    res.sendFile(path.join(__dirname, "private", "velkommen.html"))
                } else {
                    //Sender brukeren til feil.html om ikke brukeren finnes eller passordet er feil
                    res.sendFile(path.join(__dirname, "public", "feil.html"))
                }
            }
}

//En rute som henter ut alle brukere fra databasen og sender dem tilbake som JSON
async function brukere (req, res) { 
        //Merk at denne ruten bør sikres på ett eller annet tidspunkt. Om ikke kan alle hente ut all brukerdata når som helst.
        const stmt = db.prepare("SELECT * FROM user");
        const users = stmt.all();
        res.json(users)
}

//En rute for å oppdatere en bruker
async function oppdatere (req, res) {
        console.log(req.body)
        // UPDATE stamtment har syntaksen UPDATE tabell SET kolonne = verdi, kontonne = verdi WHERE kolonne = verdi
        const stmt = db.prepare("UPDATE user SET fornavn = ?, etternavn = ?, fdato = ?, epost = ?, brukernavn = ? WHERE id = ?");
        stmt.run(req.body.fornavn, req.body.etternavn, req.body.fdato, req.body.epost, req.body.brukernavn, req.body.id);
        //Sender brukeren tilbake til siden de kom fra, dvs skjemaet de var på.
        res.sendStatus(200);
}

async function admin(req, res) {
        res.sendFile(path.join(__dirname, "private", "admin.html"))
}

async function loginaction  (req, res) {
        res.sendFile(path.join(__dirname, "public", "login.html"))        
}


exports.registrer = registrer;
exports.login = login;
exports.brukere = brukere;
exports.oppdatere = oppdatere;
exports.loginaction = loginaction;
exports.admin = admin;