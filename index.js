var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var formidable = require('formidable');
const jo = require('jpeg-autorotate')
var port = process.env.PORT || 8080;

io.on('connection', function(socket){
    fs.readdir("./images", (err, files) => {
        if(err) return console.log(err);
        socket.emit("allImages", files);
      });
});
    const addPhoto = (req,res) =>{
        var form = new formidable.IncomingForm();
        console.log("parsed form")
        form.parse(req, function (err, fields, files) {
            console.log("again parsed")
          var oldpath = files.filetoupload.path;
          var newpath = "/images/" + Math.random()+files.filetoupload.name;
          fs.rename(oldpath, "."+newpath, function (err) {
              console.log("renamed file")
            jo.rotate("."+newpath, {quality:100}, (error, buffer, orientation, dimensions, quality) => {
                console.log("rotatedfile")
                if (error) {
                  return
                }
                fs.writeFileSync("."+newpath, buffer);
                console.log("writted filed")
              })
            if (err) throw err;
            io.emit("newPhoto", newpath);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<meta http-equiv="refresh" content="0;url=/done" />');
            res.end();
          });
     });
    }
    app.post('/add', addPhoto);

    app.set('view engine', 'ejs');
    
    app.get('/view', function(req, res){
        res.sendFile(__dirname + '/viewPhotos.html');
    });
    app.get('/done', function(req, res){
        res.sendFile(__dirname + '/done.html');
    });
    app.get('/', function(req, res){
        res.sendFile(__dirname + '/addPhoto.html');
    });
    app.get("/images/*", function(req,res){
        res.sendFile(__dirname + req.url);
    })

    http.listen(port, function(){
        console.log('listening on ' + port);
      });