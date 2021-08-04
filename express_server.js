const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 3001;
const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));
app.use (cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
//// users object
const users = {

  "1": {
    id: "1", 
    email: "1@1", 
    password: "1"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
//// HELPER register route
const validateString = (str1, str2) => {
  if (!str1 || !str2){
    return false
  }
  return true
};

////HELPER registration route
const validateEmail = (newUser) => {
  for (const userObj in users) {
    if(users[userObj].email === newUser) {
      return false
    } 
  }
  return true
};

//// HELPER set cookie at login. Will return userId from db
const lookupEmail = (findThisEmail) => {
  let Id = null;
  for (const user in users) {
    const lookupEmail = users[user].email;
    
    if (lookupEmail === findThisEmail) {
      // console.log("email match")
      // console.log("user_id: ", users[user].id)
      Id = users[user].id;
    }
  }
  return Id
}
////HELPER validate pass and emial match. return t/f
const lookupPass = (email, password) => {

  for (const user in users) {
    if(users[user].email === email) {  
      return (users[user].password === password ? true : false)
    }
  }
  return false
}

//// HELPER generate randomkey
const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};


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

//// login cookie login post
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const userIdFrDb = lookupEmail(userEmail);
  const emailPassValidated = lookupPass(userEmail, userPass);

  
 
  // set new cookie and redirrect
  if (emailPassValidated){
    return res.cookie("user_id", userIdFrDb).redirect(`/urls`);
  } else {
    return res.sendStatus(403);
  }
  
}) 

//// signout remove cookie
app.post('/logout', (req, res) => {
  console.log('\nLOGOUT END POINT HAS BEENHIT \n')
  res.clearCookie('user_id');
  res.redirect(`/urls`);
})

//// display newurl
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"]
  const templateVars = {
    user: users[userId]
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
  const userId = req.cookies["user_id"]
  const templateVars = {
    user: users[userId],
    shortURL,
    longURL,
  };
  res.render("urls_show", templateVars);
});

//// show existing urls
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"]
  const templateVars = {
    user: users[userId],
     urls: urlDatabase 
    };

  res.render("urls_index", templateVars);
});

//// register page
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"]
  const templateVars = {
    user: users[userId]
  }
  res.render("register", templateVars)
})

//// login page get
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"]
  const templateVars = {
    user: users[userId]
  }
  res.render("login", templateVars)

})


//// endpoint for new register
app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userPassValidated = validateString(userEmail, userPassword);
  const emailValidated = validateEmail(userEmail);
  //ERROR checking
  if(!userPassValidated){
    console.log("\n\n INVALIDE ENTRY")
    return res.status(400).send('STATUS CODE 400 INVALIDE ENTRY');
  }

  if(!emailValidated){
    console.log("\n\n INVALIDE EMAIL")

    return res.status(400).send('STATUS CODE 400 EMAIL ALREADY REGISTERED');
  }

  users[userId] = {
    id: userId,
    email: userEmail,
    password: userPassword
  }

  res.cookie("user_id", userId)
  res.redirect(`/urls`);
})



app.listen(PORT, () => {
  console.log(`Test app. Listening on port ${PORT}.`);
});
