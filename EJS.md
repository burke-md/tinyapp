### Install the ejs package:

```npm install ejs@3.1.6```

### set the view engine to ejs
```app.set('view engine', 'ejs');```

### create views/partials directory
w/ file head.ejs to include <head> html

Repeate for header and footer

### create new directory views/pages
inside pages create index.ejs file

#### use ``` <%- include('RELATIVE/PATH/TO/FILE') %>```
to include partials (head. header and footer into larger html file)
```<!DOCTYPE html>
<html lang="en">
<head>
  <%- include('../partials/head'); %>
</head>
```

-------------
Create variables inside app.get (server.js)
``` 
const tagline = "tagline string"
```

inside index.ejs file  use
```
<p><%= tagline %></p>
```
to access js variable in server.js


### use res.render()

ex: ```
res.render('user-profile', objectWithValuesForUser-profile)



** look up ps aux | grep node


### ejs files must go within views folder
