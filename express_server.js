const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 3001;
const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));
app.use (cookieParser());
app.set("view engine", "ejs");

//generate randomkey
const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
//// users object
const users = {

  "userRandomID": {
    id: "1", 
    email: "1@e1", 
    password: "1"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//// update existing post db
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const updateLongURL = req.body.longURL
  urlDatabase[id] = updateLongURL

});


//// deleteurl postdelete
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

//// signin cookie
app.post("/login", (req, res) => {
  const value = req.body.username;
  // console.log("\n LOGIN END POINT HIT"  
  // set new cookie
  res.cookie("username", value)
  res.redirect(`/urls`);
})

//// signout remove cookie
app.post('/logout', (req, res) => {
  console.log('\nLOGOUT END POINT HAS BEENHIT \n')
  res.clearCookie('username');
  res.redirect(`/urls`);
})

//// display newurl
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users["username"]
  }
  res.render("urls_new", templateVars);
});


//// create new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

///// display shorturl
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    user: users["username"],
    shortURL,
    longURL,
  };
  res.render("urls_show", templateVars);
});

//// show existing urls
app.get("/urls", (req, res) => {
  const userId = req.cookies["username"]
  const templateVars = {
    user: users[userId],
     urls: urlDatabase 
    };

    console.log("\n templateVars.user: \n", templateVars.user)

  res.render("urls_index", templateVars);
});

//// register page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users["username"]
  }
  res.render("register", templateVars)
})


//// endpoint for new register
app.post("/register", (req, res) => {

  const userId = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  users[userId] = {
    id: userId,
    email: userEmail,
    password: userPassword
  }
  res.cookie("username", userId)

  console.log("\nupdates user db: \n", users[userId])

  res.redirect(`/urls`);
})



app.listen(PORT, () => {
  console.log(`Test app. Listening on port ${PORT}.`);
});
