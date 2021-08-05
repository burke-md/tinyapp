const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3001;
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.com",
    userID: "aJ48lW",
  },
};
//// users object
const users = {
  1: {
    id: "1",
    email: "1@1",
    password: "1",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
//// HELPER register route
const validateString = (str1, str2) => {
  if (!str1 || !str2) {
    return false;
  }
  return true;
};

////HELPER registration route
const validateEmail = (newUser) => {
  for (const userObj in users) {
    if (users[userObj].email === newUser) {
      return false;
    }
  }
  return true;
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
  return Id;
};
////HELPER validate pass and emial match. return t/f
const lookupPass = (testEmail, testPass) => {
  for (const user in users) {

    if (users[user].email === testEmail) {

      const storedPass = users[user].password;
      return bcrypt.compareSync(testPass, storedPass);
      
    }
  }
  return false;
};
////HELPER does short link exist? return t/v
const isGoodLink = (link) => {
  for (const item in urlDatabase) {
    if (item === link) {
      return true;
    }
  }
  return false;
};

//// HELPER generate randomkey
const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};

//// HELPER returns obj w/ only items that qualify
const filterDb = (userId) => {
  let newObj = {};
  for (const item in urlDatabase) {
    if (urlDatabase[item].userID === userId) {
      newObj[item] = urlDatabase[item];
    }
  }
  return newObj;
};

//// update existing post db
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const updateLongURL = req.body.longURL;

  urlDatabase[id].longURL = updateLongURL;
  res.redirect(`/urls`);
});

//// deleteurl postdelete
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === userId) {

    delete urlDatabase[shortURL];
  }
  res.redirect(`/urls`);
});

//// login cookie login post
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const userIdFrDb = lookupEmail(userEmail);
  const emailPassValidated = lookupPass(userEmail, userPass);

  if (emailPassValidated) {
    return res.cookie("user_id", userIdFrDb).redirect(`/urls`);
  } else {
    return res.sendStatus(403);
  }
});

//// signout remove cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

//// display newurl
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
  };

  if (userId) {
    return res.render("urls_new", templateVars);
  }
  res.redirect(`/login`);
});

//// create new url
app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = generateRandomString();
  const fullURL = req.body.longURL;

  const newOBJ = {
    longURL: fullURL,
    userID: userId,
  };

  if (userId) {
    urlDatabase[shortURL] = newOBJ;
  } else {
    return res.sendStatus(403);
  }

  res.redirect(`/urls/${shortURL}`);
});

///// display shorturl
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const shortExists = isGoodLink(shortURL);
  const userId = req.cookies["user_id"];

  if (!shortExists) {
    return res.status(404).send("Short url does not exist");
  }

  let templateVars = {
    user: users[userId],
  };
  if (!userId) {
    return res.render(`noLogin`, templateVars);
  }
  if (urlDatabase[shortURL].userID === userId) {
    const longURL = urlDatabase[shortURL].longURL;

    templateVars = {
      user: users[userId],
      shortURL,
      longURL,
    };
    res.render("urls_show", templateVars);
  }
  res.status(403).send("URL Does not belong to your account");
});

//// show existing urls
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  //return db w/ id only items
  const filteredUrlDatabase = filterDb(userId);
  const templateVars = {
    user: users[userId],
    urls: filteredUrlDatabase,
  };

  if (!userId) {
    console.log("no log in redirect");
    return res.render(`noLogin`, templateVars);
  }

  res.render("urls_index", templateVars);
});

//// register page
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
  };
  res.render("register", templateVars);
});

//// login page get
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
  };
  if (userId) {
    return res.redirect(`/urls`);
  }

  res.render("login", templateVars);
});

//// endpoint for new register
app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashPassword = bcrypt.hashSync(userPassword, 10);
  const userPassValidated = validateString(userEmail, userPassword);
  const emailValidated = validateEmail(userEmail);

  if (!userPassValidated) {
    console.log("\n\n INVALIDE ENTRY");
    return res.status(400).send("STATUS CODE 400 INVALIDE ENTRY");
  }

  if (!emailValidated) {
    console.log("\n\n INVALIDE EMAIL");

    return res.status(400).send("STATUS CODE 400 EMAIL ALREADY REGISTERED");
  }

  users[userId] = {
    id: userId,
    email: userEmail,
    password: hashPassword,
  };

  res.cookie("user_id", userId);
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Test app. Listening on port ${PORT}.`);
});
