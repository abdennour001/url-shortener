const path = require("path");
const express = require("express");
const morgan = require("morgan");
const yup = require("yup");
const helmet = require("helmet");
const cors = require("cors");
const monk = require("monk");
const { nanoid } = require("nanoid");
const bodyParser = require("body-parser");
var validUrl = require("valid-url");
if (process.env.NODE_ENV !== "production") require("dotenv").config();

const app = express();
const db = monk(process.env.MONGODB_URI);
db.on("open", () => {
    console.log("Database connected.");
});
const urls = db.get("urls");
urls.createIndex({ slug: 1 }, { unique: true });

app.use(helmet());
app.use(morgan("common"));
app.use(express.json());
app.use(express.static("./public"));

//CORS Should be restricted
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});

// Use the body parser middleware for post requests
app.use(bodyParser.json());

const errorPage = path.join(__dirname, "public/404.html");

app.post("/url", async (req, res) => {
    let { slug, url } = req.body;

    if (!url) {
        return res.status(400).send({ error: "url is required" });
    }

    // Check if the image_url is a valid url.
    if (!validUrl.isUri(url)) {
        return res.status(400).send({ error: "url must be a valid url" });
    }

    if (!slug) {
        // generate a random slug
        slug = nanoid(5);
        slug = slug.toLowerCase();
    }

    const existing = await urls.findOne({ slug });
    if (existing) {
        return res.status(404).send({ error: "Slug in use. 🍔" });
    }

    // all good insert url
    const created = urls
        .insert({ slug: slug, url: url })
        .then(docs => {
            // send feed back
            res.json(docs);
        })
        .catch(err => {
            return res.status(404).send({ error: err });
        });
});

app.get("/:slug", async (req, res) => {
    const { slug } = req.params;

    const existing = await urls.findOne({ slug });
    if (existing) {
        res.redirect(existing.url);
    } else {
        res.status(404).sendFile(errorPage);
    }
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log(`Listening at port:  http://localhost:${port}`);
});
