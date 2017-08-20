const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const mustacheExpress = require('mustache-express');
const bodyParser = require("body-parser");
const session = require('express-session');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSalt(10);
const methodOverride = require('method-override');
const pg = require('pg');

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

// var db = pgp('postgres://macbook@localhost:5432/moongarden');
var db = pgp('postgres://gjtqmpggmgeuzp:a223b0a98427908099bdde72706ea3af2929bd0f3dde6a1282696683a4b47e24@ec2-23-23-227-188.compute-1.amazonaws.com:5432/d1ev8ka848bkce');

var port = process.env.PORT || 8080;



pg.defaults.ssl = true;

var pool = new pg.Pool();

// pool.end();

pool.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  client
    .query('SELECT table_schema,table_name FROM information_schema.tables;')
    .on('row', function(row) {
      console.log(JSON.stringify(row));
    });
    done();
});
//===========================================================

app.get('/', function(req, res){
  let user = req.session.user;
  if(user){
    let data = {
      "logged_in": true,
      "garden_id": user.garden_id,
      "handle": user.handle
    };
    console.log("user session up");
    res.render('index', data);
  } else {
    console.log("user session not up");
    res.render('index');
  }
});

app.post('/login', function(req, res){
  let data = req.body;
  let auth_error = "Authorization Failed: Invalid email/password";

  db
    .one("SELECT * FROM users WHERE email = $1", [data.email])
    .then(function(user){   //here
      bcrypt.compare(data.password, user.password_digest, function(err, cmp){
        if(cmp){
          req.session.user = user;
          res.redirect("/");
        } else {
          res.send(auth_error);
        }
      })
    })
    .catch(function(){
      res.send(auth_error);
    })
});

app.get('/signup', function(req, res){
  res.render('signup/index');
});


app.post('/signup', function(req, res){
  let newGarden = "{}";
  let birthday = 0;
  let bod = req.body;
  let auth_error = "Authorization Failed: Invalid email/password";
  // let gard_id;

  db
    .one("INSERT INTO gardens (garden_name, garden_owner, contents, birthday)   VALUES($1,$2,$3,$4) returning *", [bod.garden_name, bod.handle, newGarden, birthday])
    .catch(function(e){
        res.send('Failed to create garden: ' + e);
      })
    .then(function(data){
      // gard_id = data.id;
      bcrypt
        .hash(bod.password, 10, function(err, hash){
          db
          .one("INSERT INTO users (email, password_digest, handle, garden_id) VALUES ($1, $2, $3, $4) returning *", [bod.email, hash, bod.handle, data.id])
          .catch(function(e){
              res.send('Failed to create user: ' + e);
          })
          .then(function(data){
              console.log(data);
              res.redirect('/garden/'+data.garden_id);
          });
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
  console.log(user.garden_id);
  db
    .one("SELECT * FROM gardens WHERE id = $1", [user.garden_id])
    .then(function(data){
      if(user){
        console.log(data);
        data.handle = req.session.user.handle;
        res.render('garden/show', data);
      } else {
        res.render('index');
      };
    })
    .catch(function(e) {
      res.send('Failed to get garden contents ' + e);
    })
});

// works with post
app.post('/garden', function(req,res) {
  let user = req.session.user;
  if (user) { console.log("user ok"); } else { console.log("no user"); }
  db
    .none("UPDATE gardens SET contents = $1 WHERE id = $2",
      [req.body.contents, user.garden_id])
    .then(function() {
      res.redirect('garden/show');
    })
    .catch(function(e) {
      res.send('Failed to update garden contents ' + e);
    })
});

app.listen(port, function () {
  console.log('Server on port by heroku.');
});

/////////////////////////////////////////////////////////////
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
