var express = require("express");
// var mongodb = require("mongodb");
var router = express.Router();
var path = require("path");
var request = require("request");

// var axios = require("axios");
var cheerio = require("cheerio");

var Notes = require("../models/Notes.js");
var Article = require("../models/Article.js");
var Index = require("../models/Index.js");

router.get("/", function(req, res)  {
    res.redirect("/articles");
})


router.get("/scrape", function(req, res)   {
    axios.get("https://www.npr.org/").then(function(response)  {
    var $ = cheerio.load(html);
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

router.get("/articles", function(req, res) {
    db.Article.find({})
        .then(function(dbArticle)   {
            res.json(dbArticle);
        })
        .catch(function(err)    {
            res.json(err);
        });
});

router.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function(dbArticle)   {
            res.json(dbArticle);
        })
        .catch(function(err)    {
            res.json(err);
        });
});

router.post("/articles/:id", function(req, res)    {
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




router.listen(PORT, function() {
    console.log("App is running on port " + PORT + "!");
})