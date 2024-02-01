const express = require('express');
const path = require('path');
const db = require("better-sqlite3")("database.db", {verbose: console.log});
const bcrypt = require("bcrypt");
const session = require("express-session");
const fileUpload = require("express-fileupload")
const fs = require("fs");
const exp = require('constants');

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

async function slett(req, res) {
    // DELETE stamtment har syntaksen DELETE FROM tabell WHERE kolonne = verdi
    const stmt = db.prepare("DELETE FROM user WHERE id = ?");
    stmt.run(req.params.id);
    //Sender brukeren tilbake til siden de kom fra, dvs skjemaet de var på.
    res.redirect("back")
}

async function kommenter(req, res) {
    console.log(req.body)
    const stmt = db.prepare("INSERT INTO comments (comment, user_id, photo_id) VALUES (?, ?, ?)")
    stmt.run(req.body.kommentar, req.session.userid, req.body.photo_id)
    res.sendStatus(200)
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

async function lastopp(req, res) {    
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

}

async function brukere (req, res) { 
    const stmt = db.prepare("SELECT * FROM user");
    const users = stmt.all();
    res.json(users)
}

async function bilder(req, res) {
    const stmt = db.prepare("SELECT * FROM photos")
    const photos = stmt.all()
    res.json(photos)   
}

async function kommentarer(req, res) {
    const stmt = db.prepare("SELECT * FROM comments INNER JOIN user ON comments.user_id = user.id INNER JOIN photos ON comments.photo_id = photos.id WHERE photos.id = ?")
    const comments = stmt.all(req.params.id)
    res.json(comments)
}

exports.slett = slett;
exports.kommenter = kommenter;
exports.registrer = registrer;
exports.oppdatere = oppdatere;
exports.lastopp = lastopp;
exports.brukere = brukere;
exports.bilder = bilder;
exports.kommentarer = kommentarer;