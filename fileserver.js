var express = require('express'); //external
var form = require('connect-form'); //external
var mime = require('mime'); //external
var url = require('url');
var fs = require('fs');
var path = require('path');

var app = express.createServer(form({ keepExtensions: true }));

documentRoot = "./public_html";

app.post(/upload\/$/, function(req, resp) {
    req.form.complete(function(err, fields, files) {
        if (err) {
            return write500(resp, "failed to upload image");
        }

        var src = files.image.path;
        var dest = documentRoot + '/img/' + files.image.name;
        console.log(src);
        console.log(dest);

        fs.rename(src, dest, function(err) {
            if (err) {
                return write500(resp, "failed to upload image");
            }

            resp.writeHead(200, {"Content-Type":"application/json"})
            resp.write(JSON.stringify({"status":"complete"}));
            resp.end();
        });
    });
});


// get static files
app.get(/.*/, function(req, resp) {
    console.log('requesting : ' + req.path);
    fileName = __dirname + '/public_html' + req.path;

    (function(file) {
        fs.stat(file, function(err, stats) {

        if (err) {
            console.log('file not found');
            return write404(resp, req.path + ' not found');
        }

        if (stats.isDirectory()) {

            fs.readdir(file, function(err, files) {
                resp.writeHead(200, {})
                resp.write(JSON.stringify(files));
                resp.end();
                return;
            });

        } else {

            fs.readFile(file, function(error, content) {

                if (error) {
                    return write404(resp, req.path + ' not found');
                } else {
                    /*
                    console.log(
                        'serving file ' + req.path + ': ' +
                        mime.lookup(req.path)
                        );
                    */

                    resp.writeHead(200, {
                        'Content-Type': mime.lookup(req.path)
                        })
                    resp.write(content);
                    resp.end();
                    return;

                }
            });
          }
      })
    })(fileName);
});

function write404(resp, message) {
    resp.writeHead(404, {});
    resp.write(message);
    resp.end();
}

function write500(resp, message) {
    resp.writeHead(500, {});
    resp.write(resp, "failed to upload image");
    resp.end();
}

app.listen(8000);
