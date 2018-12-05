var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
 var filter = require('content-filter');
var sanitizeHtml = require('sanitize-html');
var multer = require('multer');
var cloudinary = require('cloudinary');
const formidable = require('formidable');
var util = require('util');
const path = require('path');
var os = require('os');
//var fileUpload = require('express-fileupload');
 //var cloudinaryStorage = require('multer-storage-cloudinary');
var app  = express();
require('dotenv').config();
const http = require('http').Server(app);
var io = require("socket.io")(http);
//var dbUrl = 'mongodb://PhillyChatUser:phillychatjj1@ds151463.mlab.com:51463/chatmessages';
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

cloudinary.config({
  cloud_name:'phillychat',
  api_key:'131581869472749',
  api_secret:'DG0wWVNMBnFjZ6qXm2P92l29HmE'
});

  app.post('/cloud', function(req, res) {

    app.use(formidable);
    var form = new formidable.IncomingForm();
      form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n' );
      res.end(util.inspect({fields: fields, files: files}));
      var path = files.myfile.path;
      cloudinary.v2.uploader.upload(path, {folder: "chatpictures"},
   function(error, result) {console.log(result, error);
     });
    });
  });

var blackList = ['$','{','&&','||'];
var options = {
 urlBlackList: blackList,
 bodyBlackList: blackList
};
 app.use(filter(options));


sanitizeHtml({
allowedTags:['strong', 'em', 'a', '<'],
allowedAttributes:{
  'a': ['href']
}
});


 mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/herokudb',{ useNewUrlParser: true}, function(error){
 console.log('Here is Database Connection error', error);
console.log(process.env.MONGODB_URI);
});
mongoose.connection.on('connected', function(){console.log("successfully connected to Database");});



mongoose.Promise = Promise;
var Messages = mongoose.model('messages', {
  name: String,
  chat: String
 });
  app.post("/chats",  function (req, res)  {
     try {
         var chat = new Messages(req.body);
         chat.save().then(function(){
           console.log('sent');
         }).catch(function(err){
           res.status(400).send('unable to save to Database');
           console.log('error saving to database');
         });

        res.sendStatus(200);
        //Emit the event
      io.emit("chat", req.body);
          }
         catch (error) {
         res.sendStatus(500);
         console.error(error);
     }
 });

app.get("/chats", (req, res) => {
    Messages.find({}, (error, chats) => {
        res.send(chats);
    });

});

app.get('/images', function(req, res){
var finalResult;
    cloudinary.api.resources({type:"upload",prefix:"chatpictures/"}, function(error, result){
      console.log(error, result);
   finalResult = result;
    });
  res.send(finalResult + "\n");
});

io.on("connection", function(socket, error){
console.log("Socket Connected...");
  console.log('System information: ' + os.platform()); // "Windows_NT"
console.log(error);

socket.on('chat', function(data){
 io.sockets.emit('chat', data);
});

socket.on("typing", function(data){
  socket.broadcast.emit("typing", data);
  });
});

var server = http.listen(process.env.PORT || 3020, () => {
    console.log("Well done, now I am listening on ", server.address().port);
});
