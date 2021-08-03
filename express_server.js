const express = require("express");
const app = express();
const PORT = 3001;
const bodyParser = require("body-parser");
//OLD WAY?? app.use(bodyparser.urlencoded({ extended: true}))
////
//deleting urls needs some help in urls_index line 29

////
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

//generate randomkey
const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//// deleteurl postdelete
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

//// display newurl
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  console.log("database", urlDatabase);
  console.log("longurl form db", urlDatabase[shortURL]);

  res.redirect(`/urls/${shortURL}`);
});
///// display shorturl
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  const templateVars = {
    shortURL,
    longURL,
  };

  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Test app. Listening on port ${PORT}.`);
});
