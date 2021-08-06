const express = require("express");
const cookieSession = require("cookie-session");
const getUserByEmail = require("./helpers.js");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

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

//HELPER validate pass and emial match. return t/f
const lookupPass = (testEmail, testPass) => {
  for (const user in users) {
    if (users[user].email === testEmail) {
      const storedPass = users[user].password;
      return bcrypt.compareSync(testPass, storedPass);
    }
  }
  return false;
};

//HELPER does short link exist? return t/v
const isGoodLink = (link) => {
  for (const item in urlDatabase) {
    if (item === link) {
      return true;
    }
  }
  return false;
};

//HELPER generate randomkey
const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};

//HELPER returns filtered object
const filterDb = (userId) => {
  let newObj = {};
  for (const item in urlDatabase) {
    if (urlDatabase[item].userID === userId) {
      newObj[item] = urlDatabase[item];
    }
  }
  return newObj;
};

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const updateLongURL = req.body.longURL;
  urlDatabase[id].longURL = updateLongURL;

  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === userId) {
    delete urlDatabase[shortURL];
  }

  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const userIdFrDb = getUserByEmail(userEmail, users);
  const emailPassValidated = lookupPass(userEmail, userPass);

  if (emailPassValidated) {
    //Set cookie
    req.session.userId = userIdFrDb;

    const userId = req.session.userId;
    const templateVars = 
    {
      user: users[userId],
    };
    return res.redirect(`/urls`);
  } else {
    res.send(
      "<h4>You've strayed form the happy path. Invalid email or pass</h4>"
    );
  }
});

app.post("/logout", (req, res) => {
  //Clear cookie
  req.session = null;

  res.redirect(`/urls`);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;

  const templateVars = {
    user: users[userId],
  };

  if (userId) {
    return res.render("./partials/urls_new", templateVars);
  }

  res.redirect(`/login`);
});

app.post("/urls", (req, res) => {
  const userId = req.session.userId;
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


app.get("/u/:shortURL", (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const shortExists = isGoodLink(shortURL);

  if (!shortExists) {
    return res.status(404).send("Short url does not exist");
  }

  let templateVars = {
    user: users[userId],
  };

  if (!userId) {
    return res.render(`./partials/noLogin`, templateVars);
  }

  if (urlDatabase[shortURL].userID === userId) {
    res.redirect(longURL);
  }
  res.status(403).send("URL Does not belong to your account");
});


app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.shortURL;
  const shortExists = isGoodLink(shortURL);

  if (!shortExists) {
    return res.status(404).send("<h4>Short url does not exist</h4>");
  }

  let templateVars = {
    user: users[userId],
  };

  if (!userId) {
    return res.render(`./partials/noLogin`, templateVars);
  }

  if (urlDatabase[shortURL].userID === userId) {
    const longURL = urlDatabase[shortURL].longURL;

    templateVars = {
      user: users[userId],
      shortURL,
      longURL,
    };
    return res.render("./partials/urls_show", templateVars);
  }
  res.status(403).send("<h4>URL Does not belong to your account</h4>");
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const filteredUrlDatabase = filterDb(userId);
  const templateVars = 
  {
    user: users[userId],
    urls: filteredUrlDatabase,
  };

  if (!userId) {
    return res.render(`./partials/noLogin`, templateVars);
  }

  res.render("./partials/urls_index", templateVars);
});


app.get("/register", (req, res) => {
  const userId = req.session.userId;
  const templateVars = {
    user: users[userId],
  };
  res.render("./partials/register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.userId;
  const templateVars = 
  {
    user: users[userId],
  };
  if (userId) {
    return res.redirect(`/urls`);
  }

  res.render("./partials/login", templateVars);
});


app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(userPassword, salt);

  if (!userEmail || !userPassword) {
    return res
      .status(400)
      .send("Invalid email or password. Login <a href='/register'>here.</a> ");
  }

  if (getUserByEmail(userEmail, users)) {
    return res.status(400).send("<h4>Email exists in system.</h4>");
  }

  users[userId] = {
    id: userId,
    email: userEmail,
    password: hashPassword,
  };

  //Set cookie
  req.session.userId = userId;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Test app. Listening on port ${PORT}.`);
});
