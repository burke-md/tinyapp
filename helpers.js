const getUserByEmail = (email, database) => {
  let user = undefined;
  for (const item in database) {
    const lookupEmail = database[item].email;

    if (lookupEmail === email) {
      user = database[item].id;
    }
  }
  return user;
};

module.exports = getUserByEmail;
