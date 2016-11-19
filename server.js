var express = require('express');
var http = require('http');
var  ejs = require('ejs');
var bodyParser = require('body-parser');
var Client = require('node-rest-client').Client;
var Twitter = require('twitter');
var session = require('express-session');
var twitterClient = new Twitter({
  consumer_key: 'A8LLgO6mLrzCG3acqlP5PLlNR',
  consumer_secret: 'YmUENMadQd2SPhPQmiI6ZRE8prio5rkA546aj69OHmp6B9GOyf',
  access_token_key: '2171168619-SO9G4i0eH4gAE588hlbgfWgLntE2eXUIy8aX87p',
  access_token_secret: 'pY5ib5fEXvr1ASe8BGjvJaCxVUqykGKBCuxTtGGlTFzOk'
});
var app = express();
var client = new Client();
app.set('views', './views');
app.engine('html', ejs.renderFile);
app.use(express.static('./js'));
app.use(express.static('./images'));
app.use(express.static('./styles'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: 'TicketMaterDevJam',
  resave: true,
  saveUninitialized: true,
  cookie: {
    path: '/',
    httpnly: false,
    secure: true,
    maxAge: 5*60*1000
  }
}));
app.use(bodyParser.json());
var eventDetails;
http.createServer(app).listen(8088);
app.get('/socialInfo/:eventId', function(req, res) {
  var eventName = req.param('eventId');
  console.log("eventName : "+eventName);
  req.session.eventName = eventName;
  eventDetails = eventName;
  console.log(req.session.eventName);
  var params = {
    q: eventName,
    lang: 'en',
    count: 20
  };
  twitterClient.get('search/tweets', params, function(error, tweets, response) {
    if (!error) {
      // console.log("data");
      // console.log(tweets);
      var statuses = [];
      statuses = tweets.statuses;
      var userData = [];
      for(var x in statuses){
          var obj=new Object();
          obj.name = statuses[x].user.screen_name;
          obj.img= statuses[x].user.profile_image_url;
          userData.push(obj);
      }
      app.render('topUsers.html', {
        userData: JSON.stringify(userData)
      }, function(err, renderedData) {
         res.send(renderedData);
      });
      //console.log(userData);
    }else{
      console.log("error");
      console.log(error);
    }
  });
  // var getUser= client.get("https://api.twitter.com/1.1/search/tweets.json?q=Arizona%20Coyotes%20&lang=en&result_type=popular&count=20", function(data, response){
  //   console.log(data);

  // });
});
app.get('/', function(req, res) {
  var startDate = new Date().toISOString().split('.')[0]+'Z';
  var endDate  = new Date(new Date().getTime()+7*24*60*60*1000).toISOString().split('.')[0]+'Z';
  var clientRequest = client.get("https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&startDateTime="+startDate+"&endDateTime="+endDate+"&apikey=FLO2cOlVQcvRC0Vvc9KtVoeBTSb1HEok", function(data, response){
            var events = [];
            events = data._embedded.events;
            var eventsData = [];
            var count =0;
            for(var e in events){
              var o = new Object();
              if(Date.parse(events[e].dates.start.dateTime) > Date.now() && Date.parse(events[e].dates.start.dateTime) < Date.parse(endDate) && count < 10){
                o.name = events[e].name;
                o.id = events[e].id;
                o.url = events[e].url;
                o.imgUrL = events[e].images[0].url;
                o.startDate = events[e].dates.start.localDate +" " +events[e].dates.start.localTime;
                eventsData.push(o);
                count++;
              }
            }
            app.render('index.html', {
              eventsData: JSON.stringify(eventsData)
            }, function(err, renderedData) {
               res.send(renderedData);
            });
  });
});
app.get('/relatedTweets/:userId', function(req, res) {
  var userId = req.param('userId');
  console.log("userId : "+userId);
  console.log(eventDetails);
  var params = {
    q: eventDetails+" from:"+userId,
    lang: 'en',
    count: 5
  };
  twitterClient.get('search/tweets', params, function(error, tweets, response) {
    if (!error) {
      // console.log("data");
      // console.log(tweets);
      var statuses = [];
      statuses = tweets.statuses;
      var userData = [];
      for(var x in statuses){
          var obj=new Object();
          obj.tid = statuses[x].id_str;
          userData.push(obj);
      }
      app.render('userTweets.html', {
        userData: JSON.stringify(userData)
      }, function(err, renderedData) {
         res.send(renderedData);
      });
      //console.log(userData);
    }else{
      console.log("error");
      console.log(error);
    }
  });
});
app.param('eventId', function(req, res, next, value) {
    console.log('\nRequest received with eventId: ' + value);
    next();
});
app.param('userId', function(req, res, next, value) {
    console.log('\nRequest received with userId: ' + value);
    next();
});
