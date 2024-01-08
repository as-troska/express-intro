const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

let navn = "Dole"


app.get("/info", (req, res) => {
    console.log("Noen prøvde å nå /info")
    console.log(req.query)
    res.send("OK")
});

app.get("/sendData", (req, res) => {
    res.send(navn)
})

app.post("/infoPost", (req, res) => {
    console.log("Noen prøvde å nå /info")
    console.log(req.body)

    navn = req.body.navn

    res.sendFile(path.join(__dirname, "public", "taimot.html"))

});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})