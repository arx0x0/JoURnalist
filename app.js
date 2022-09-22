const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const _ = require("lodash");
const axios = require('axios');
const mongoose = require('mongoose');


const homeStartingContent = "Imagine the first of its kind, simple, interactive online news sharing site, where users can SHARE any recent news they want, whenever they want to, and even act like meteorologists by sharing the WEATHER in their city, as long as it follows our community guidelines." + " This is intended for small friend groups, you can simply copy this project, then add and connect a mongoDB database, and upload it to heroku or other web hosting services and then enjoy it with all of your friends.";
const guideLines = "Our guidelines are simple: Each user can post as much as they want to everyday, no swearing or offending anyone, nothing 18+, once you post you cannot delete your post so be careful, and most importantly: DON'T FORGET TO INCLUDE THE SOURCES YOU USE FOR YOUR POST!";
const aboutContent = "The Boring Stuff: This project includes EJS for creating partials for the header and footers at each page, and for being able to easily pass values such as user inputs or strings into the respective EJS files, by first app.posting the form submit results from one page to our app.js file and then app.getting the resultant changes of that push but now rendering the changes needed by our EJS file. It also uses node for the JS runtime environment and express to make it easier and more efficient, as well as some bootstrap 5 styling and components to make everything looking nice and clean. Lastly, a weather API by courtesy of Open Weather Map has been used for this project, it has been combined with EJS, as it collects submit data from the / AKA root or home route and then it JSON parses this data and makes it readable in terms of weather terminologies, which then get passed into an array as an object all within the app.post method for the / route and the finally the app.get for the weather.ejs takes the array as an input and passes it to weather.ejs and then renders the details with a forEach loop per weather post.";
const contactContent = "Any trouble or bugs? Anyone breaking community guidelines? Or any other type of Questions? Let us know in the form below:";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Connecting mongoose to mongo also creating blogDB database
mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});

//Schema for post collection's documents
const postSchema = {
  title: String,
  content: String,
  expireAt: Number
};

//Creating post collection
const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res){

  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts,
      guideLines: guideLines
      });
  });
});

//Rendering compose page 
app.get("/compose", function(req, res){
  res.render("compose");
});

//Retrieving content (with body-parser and form) from compose page and storing it as a document in posts collection in the blogDB database 
app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  //Saving created document to now be in posts collection then redirecting to home
  post.save(function(err){
    if (!err){
        res.redirect("/");
    }
  });
});

//For Express route parameters 
app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

//Rendering content to About and contact pages respectively
app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});


//Weather Feature and API Related:

const weatherArray = [];

app.get("/weather")

app.get("/weather", function(req, res){
  res.render("weather", {
    weatherArray: weatherArray
  });
});


  app.post("/", function(req, res){
    const query = req.body.cityName;
    const userName = req.body.userName;
    const provinceName = req.body.provinceName;
    const unit = "metric";
    const apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + "Your API key goes here" +  "&units=" + unit;

  
   https.get(apiUrl, function(response){
    console.log(response.statusCode);
  
    response.on("data", function(data){
      const weatherData = JSON.parse(data);
      const temp = weatherData.main.temp;
      const WeatherDescription = weatherData.weather[0].description;
      const icon = weatherData.weather[0].icon;
      const imageURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";

      const weatherInfo = {
          query: query,
          userName: userName,
          temp: temp,
          WeatherDescription: WeatherDescription,
          icon: icon,
          imageURL: imageURL,
          provinceName: provinceName
        }

        weatherArray.push(weatherInfo);

        res.redirect("/weather");
  
      });
     })
   });


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
