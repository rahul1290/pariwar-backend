const express = require('express');
const mysql  = require('mysql');
const bodyParser = require('body-parser');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
var cors = require('cors');
const app = express();


app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT || 3001;

//============Database Connection======================= 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});

//=========================Checking Database Connection========================================
connection.connect((error) => {
    if(error) {
        console.log(error);
        return;
    }
    console.log('Connected with database')
})

app.get('/auth/facebook',passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { 
        failureRedirect: '/loginfailed' 
    }),
    function(req, res) {
    // Successful authentication, redirect home.
        console.log('successful login');
        res.redirect('/');
    });

app.get('/loginfailed',(req,res) => {
    console.log('loginfailed called');
})

//=====================Add login====================================
app.post('/login', (req, res) => {
    debugger;
    const {name,username,email,password,accessToken,platform} = req.body.logindata;
	
    //0ac2f1223672dbb2cd32514fc6cc543d
    passport.use(new FacebookStrategy({
        clientID: '181309920504328',
        clientSecret: '0ac2f1223672dbb2cd32514fc6cc543d',
        callbackURL: "http://localhost:3001/auth/facebook/callback"
      },
      function(accessToken, refreshToken, profile, cb) { 
        console.log('i am called');
        User.findOrCreate({ facebookId: profile.id }, function (err, user) {
          return cb(err, user);
        });
      }
    ));

    const loginData = {
        name: name,
        username: username,
        email:email,
        password:password,
        token:accessToken,
		provider : platform
    }
    const sql = 'Insert into users set ?';
    connection.query(sql, loginData, (error, result) => {
        if(error) {
            console.log(error);
            res.send({
                status: 500,
                data: error
            })
        }
        res.send({
            status: 200,
            data: 'login successfully'
        })
    })
})

//=====================Set Port 3000====================================
app.listen(port, () => {
    console.log(`Server is runnint at ${port}`);
})