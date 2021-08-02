const express = require("express");
const app = express();
const PORT = 3001;
const bodyParser = require("body-parser");
//OLD WAY?? app.use(bodyparser.urlencoded({ extended: true}))
app.use(express.urlencoded({extended: true}));
 
app.set("view engine", "ejs");
//generate randomkey
const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6)
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//// display newurl
app.get("/urls/new", (req, res) => {
  res.render("urls_new")
})


///// display shorturl
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };

  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls",(req, res) => {
  console.log(req.body);
  res.send("ok")
})



app.listen(PORT, () => {
  console.log(`Test app. Listening on port ${PORT}.`);
});
