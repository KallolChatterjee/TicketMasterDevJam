var express = require('express');
var http = require('http');
var  ejs = require('ejs');
var bodyParser = require('body-parser');
var Client = require('node-rest-client').Client;
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
app.use(bodyParser.json());
http.createServer(app).listen(8088);
app.get('/', function(req, res) {
  var startDate = new Date().toISOString();
  var endDate  = new Date(new Date().getTime()+7*24*60*60*1000).toISOString();
  var clientRequest = client.get("https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&startDateTime="+startDate+"&endDateTime="+endDate+"&apikey=FLO2cOlVQcvRC0Vvc9KtVoeBTSb1HEok", function(data, response){
            // console.log(data._embedded.events);
            var events = [];
            events = data._embedded.events;
            var eventsData = [];
            for(var e in events){
              var o = new Object();
              if(Date.parse(events[e].dates.start.dateTime) > Date.now() && Date.parse(events[e].dates.start.dateTime) < Date.parse(endDate)){
                o.name = events[e].name;
                o.imgUrL = events[e].images[0].url;
                eventsData.push(o);
              }
            }
            app.render('index.html', {
              eventsData: JSON.stringify(eventsData)
            }, function(err, renderedData) {
               res.send(renderedData);
            });
  });
});
