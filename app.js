const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const mustacheExpress = require('mustache-express');
const methodOverride = require('method-override')
const bodyParser = require("body-parser");
const session = require('express-session');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSalt(10);

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use("/", express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'))

app.use(session({
  secret: 'super_secret_string',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

var db = pgp('postgres://macbook@localhost:5432/moongarden');

//===========================================================

app.get('/', function(req, res){
  let user = req.session.user;
  if(user){
    let data = {
      "logged_in": true,
      "garden_id": user.garden_id,
      "handle": user.handle
    };
    res.render('index', data);
  } else {
    res.render('index');
  }
});

app.post('/login', function(req, res){
  let data = req.body;
  let auth_error = "Authorization Failed: Invalid email/password";

  db
    .one("SELECT * FROM users WHERE email = $1", [data.email])
    .catch(function(){
      res.send(auth_error);
    })
    .then(function(user){   //here
      bcrypt.compare(data.password, user.password_digest, function(err, cmp){
        if(cmp){
          req.session.user = user;
          res.redirect("/");
        } else {
          res.send(auth_error);
        }
      });
    });
});

app.get('/signup', function(req, res){
  res.render('signup/index');
});


app.post('/signup', function(req, res){
  let newGarden = {};
  let birthday = 0;
  let data = req.body; //doesn't look right
  let auth_error = "Authorization Failed: Invalid email/password";
  bcrypt
    .hash(data.password, 10, function(err, hash){
      db
      .one("INSERT INTO users (email, password_digest, handle) VALUES ($1, $2, $3) returning id", [data.email, hash, data.handle])
      // .one("INSERT INTO gardens (garden_name, garden_owner, contents, birthday)   VALUES($1,$2,$3,$4)", [])
      // how do i get the users' garden ids to match garden ids?
      .catch(function(e){
        res.send('Failed to create user and/or garden: ' + e);
      })
      .then(function(data){
        res.redirect('/');
      });
    });
});

app.put('/user', function(req, res){
  db
    .none("UPDATE users SET email = $1 WHERE email = $2",
      [req.body.email, req.session.user.email]
    ).catch(function(){
      res.send('Failed to update user.');
    }).then(function(){
      res.send('User updated.');
    });
});

app.get('/logout', function(req, res){
  req.session.user = false;
  res.redirect('/');
});

app.get('/garden/:id', function(req, res){
  let user = req.session.user;
  if(user){
    let data = {
      "logged_in": true,
      "garden_id": user.garden_id,
      "handle": user.handle
    };
    res.render('garden/show', data);
  } else {
    res.render('index');
  };
});


app.listen(3000, function () {
  console.log('Server on port 3000.');
});

/////////////////////////////////////////////////////////////
//notes thanks moe
// //get is when you want to render an html page to a specific url
// // '/foo' is the link you put after localhost:3000, so... localhost:3000/foo
// app.get('/foo',function(request,response){
//     response.render('bar');        //bar refers to the html file in your views folder
// }
// ​
// ​
// //post is when you want your server to receive the data submitted from a form:
// <form method="post" action="/shoebill">
//     <input type="text" name="coders"/>
//     <input type="submit"/>
// </form>
// app.post("/shoebill",function(request,response){
//     let string = req.body;
// }
// //generally:
// //store all html files in a folder called 'views'
// //store all client side javascript and css in a folder called 'public'
// //store all sql files in a folder called model
// //store all server side js files in a folder called controller
