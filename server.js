//server.js

//BASE SETUP
// =========================================================================
// call the necessary packages
var express = require('express');
var app = express(); //define app using express
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var rand = require('csprng');
const crypto = require('crypto');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');
var Bear = require('./app/models/bear');

// CONFIGURATION
// =========================================================================
var port = process.env.PORT || 8088;  //Sets port to variable host port or default (Won't work on hosting platform otherwise)
mongoose.connect(config.database); // connect to db
app.set('superSecret', config.secret); // secret variable

// configure app to use bodyParser(), so we can get data from POSTs
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// ROUTES
// ========================================================================
// basic route
app.get('/', function(req, res) {
  res.send('Hello! The API is in another castle. Http://192.168.3.100:' + port + '/api, to be exact');
});

var router = express.Router();  //makes instance of express router

//middleware to use for all requests
router.use(function(req, res, next) {
  //do logging
  console.log('Something is happening.');
  next(); // Makes sure we continue on to the next route and don't stop here
});

//Let's make a test route
router.get('/', function(req, res) {
  res.json({ message: 'API is get' });
});

//Additional API Routes

// on routes that end in /setup
// ---------------------------------------
app.get('/setup', function(req, res) {
//create a sample user
var salt = rand(160, 36);
  var hashedPass = crypto.pbkdf2(req.body.password, salt, iterations, keylen, digest, function(err, key) {
    if (err) throw err;
    var newUser = new User({
      name: req.body.name,
      password: key,
      salt: salt
    })
  })
  var newUser = new User({
    name: req.body.name,
    password: req.body.password,
    salt
    admin: true
  });



  //save the sample user
  john.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

// API ROUTES ----------------------------

// get an instance of the router for api routes
var apiRoutes = express.Router();

// TODO: route to authenticate a user (POST http://localhost:8088/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 1440 // expires in 24 hours
        });

        // return the information including the token as JSON
        res.json({
          success: true,
          message: 'Enjoy the tasty treat',
          token: token
        });
      }

    }

  });
});

// TODO: route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if(token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {

    // if there is no token
    // return error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

// route to show a random message (GET http://localhost:8088/api/)
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'You found the Princess, erm... API!' });
});

// route to return all users (GET http://localhost:8088/api/users)
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

app.use('/api', apiRoutes);

// on routes that end in /login
// ---------------------------------------
router.route('/login')
  //

// on routes that end in /bears
// ---------------------------------------
router.route('/bears')

  //create a bear (accesses at POST http://localhost:8088/api/bears)
  .post(function(req, res) {

    var bear = new Bear(); // create a new instance of the bear model
    bear.name = req.body.name; // set the bear's name (from the request body)

    //save the bear and check for errors
    bear.save(function(err) {
      if (err) {
        res.send(err);
      }

      res.json({ message: 'Bear created!' });
    });

  })

  // get all the bears (accessed at GET http://localhost:8088/api/bears)
  .get(function(req, res) {
    Bear.find(function(err, bears) {
      if (err) {
        res.send(err);
      }
      res.json(bears);
    });
  });

// on routes that end in /bears/:bear_id
// ---------------------------------------
router.route('/bears/:bear_id')

  // get the bear with that id (accessed at GET http://localhost:8088/api/bears/:bear_id)
  .get(function(req, res) {
    Bear.findById(req.params.bear_id, function(err, bear) {
      if (err) {
        res.send(err);
      }
      res.json(bear);
    });
  })

  // update the bear with that id (accessed at PUT http://localhost:8088/api/bears/:bear_id)
  .put(function(req, res) {

    // use Bear model to find proper bear
    Bear.findById(req.params.bear_id, function(err, bear) {

      if (err) {
        res.send(err);
      }

      bear.name = req.body.name; // update the bear's info

      bear.save(function(err) {
        if (err) {
          res.send(err);
        }
        res.json({ message: 'Bear updated!' });
      });

    });
  })

  // delete the bear with that id (accessed at DELETE http://localhost:8088/api/bears/:bear_id)
  .delete(function(req, res) {
    Bear.remove({
      _id: req.params.bear_id
    }, function(err, bear) {
      if (err) {
        res.send(err);
      }

      res.json({ message: 'Successfully deleted' });
    });
  });

//Register our Routes ---------------------------
//prefix routes with api. for lulz
app.use('/burrs', router);

// START THE SERVER
// ========================================================================
app.listen(port);
console.log('Express test server on port ' + port);
