var express = require("express");
// var mongodb = require("mongodb");
var mongoose = require("mongoose");
var logger = require("morgan");
var exphbs = require("express-handlebars");


var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models/Index");
var PORT = 3071;
var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

mongoose.connect(MONGODB_URI);

app.engine("handlebars", exphbs ({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var routes = require("./controllers/route.js");
app.use("/", routes);

// mongoose.connect("mongodb://localhost/unit")

// app.use("/", route);

app.get("/scrape", function(req, res)   {
    axios.get("https://www.npr.org/").then(function(response)  {
    var $ = cheerio.load(response.data);
    $("h3.title").each(function(i, element)   {
        var result = {};
        result.title = $(this)
            .children("a")
            .text();
        result.link = $(this)
            .children("a")
            .attr("href");

        db.Article.create(result)
            .then(function(dbArticle)   {
                console.log(dbArticle);
            })
            .catch(function(err)    {
                return res.json(err);
            });     
        });
        res.send("Scrap Complete!");  
    });
});

app.get("/articles", function(req, res) {
    db.Article.find({})
        .then(function(dbArticle)   {
            res.json(dbArticle);
        })
        .catch(function(err)    {
            res.json(err);
        });
});

app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function(dbArticle)   {
            res.json(dbArticle);
        })
        .catch(function(err)    {
            res.json(err);
        });
});

app.post("/articles/:id", function(req, res)    {
    db.Note.create(req.body)
        .then(function(dbNote)  {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, {note: dbNote._id}, { new: true });
        })
        .then(function(dbArticle)   {
            res.json(dbArticle);
        })
        .catch(function(err)    {
            res.json(err);
        });
});




app.listen(PORT, function() {
    console.log("App is running on port " + PORT + "!");
})