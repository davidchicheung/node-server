var express = require('express')
  , form = require('connect-form');
var mime = require('mime');
var url = require('url');
var fs = require('fs');

var app = express.createServer(form({ keepExtensions: true }));

documentRoot = "./public_html";

app.post(/upload$/, function(req, resp) {
    req.form.complete(function(err, fields, files) {
        if (err) {
            return write500(resp, "failed to upload image");
        }

        var src = files.image.path;
        var dest = documentRoot + '/uploads/' + files.image.name;
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

    fs.stat(fileName, function(err, stats) {

        if (err) {
            return write404(resp, req.path + ' not found');
        }

        if (stats.isDirectory()) {

            fs.readdir(fileName, function(err, files) {
                resp.writeHead(200, {})
                resp.write(JSON.stringify(files));
                resp.end();
                return;
            });

        } else {

            fs.readFile(fileName, function(error, content) {

                if (error) {
                    return write404(resp, req.path + ' not found');
                } else {

                    resp.writeHead(200, {
                        'Content-Type': mime.lookup(fileName)
                        })
                    resp.write(content);
                    resp.end();
                    return;

                }
            });
        }
    });

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

app.listen(3000);
