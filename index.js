var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var formidable = require('formidable');
const jo = require('jpeg-autorotate')

io.on('connection', function(socket){
    fs.readdir("./images", (err, files) => {
        if(err) return console.log(err);
        socket.emit("allImages", files);
      });
});
    const addPhoto = (req,res) =>{
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
          var oldpath = files.filetoupload.path;
          var newpath = "/images/" + Math.random()+files.filetoupload.name;
          fs.rename(oldpath, "."+newpath, function (err) {
            jo.rotate("."+newpath, {quality:100}, (error, buffer, orientation, dimensions, quality) => {
                if (error) {
                  console.log('An error occurred when rotating the file: ' + error.message)
                  return
                }
                console.log(`Orientation was ${orientation}`)
                console.log(`Dimensions after rotation: ${dimensions.width}x${dimensions.height}`)
                console.log(`Quality: ${quality}`);
                fs.writeFileSync("."+newpath, buffer);
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

    http.listen(3000, function(){
        console.log('listening on *:3000');
      });