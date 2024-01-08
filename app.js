const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));


app.get("/info", (req, res) => {
    console.log("Noen prøvde å nå /info")
    console.log(req.query)
    res.send("OK")
});

app.post("/infoPost", (req, res) => {
    console.log("Noen prøvde å nå /info")
    console.log(req.body)
    res.send("OK")
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})