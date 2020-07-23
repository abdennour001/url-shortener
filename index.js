const express = require("express");
const morgan = require("morgan");
const yup = require("yup");
const helmet = require("helmet");
const cors = require("cors");
const monk = require("monk");
var validUrl = require("valid-url");
require("dotenv").config();

const app = express();
const db = monk(process.env.MONGODB_URI);
const urls = db.get("urls");
urls.createIndex({ slug: 1 }, { unique: true });

app.use(helmet());
app.use(morgan("common"));
app.use(express.json());

//CORS Should be restricted
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});

app.get("/", (req, res) => {
    res.send("hello world!");
});

app.get("/:slug", (req, res) => {});

app.post("/url", (req, res) => {
    const { slug, url } = req.body;

    if (!url) {
        return res.status(400).send({ error: "url is required" });
    }

    // Check if the image_url is a valid url.
    if (!validUrl.isUri(url)) {
        return res.status(400).send({ error: "url must be a valid url" });
    }

    if (!slug) {
        // generate a random slug
    } else {
        // all good insert url
        urls.insert({ slug: slug, url: url });
    }
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log(`Listening at port:  http://localhost:${port}`);
});
