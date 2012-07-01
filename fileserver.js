var express = require( 'express' );
var form    = require( 'connect-form' );
var mime    = require( 'mime' );
var url     = require( 'url' );
var fs      = require( 'fs' );
var path    = require( 'path' );

var app     = express.createServer( form({ keepExtensions: true }) );
var io      = require( 'socket.io' ).listen( app );

var clients = [];

documentRoot = "./public_html";

app.post( /upload\/$/, function( req, resp ) {

    req.form.complete( function( err, fields, files ) {

        if ( err ) {
            return write500( resp, "failed to upload image" );
        }

        var src = files.image.path;
        var safeFileName = files.image.name.replace(
            /[^a-zA-Z0-9_\.-]/g, "_"
            );
        var dest = documentRoot + '/img/' + safeFileName;

        console.log( safeFileName );
        console.log( dest );

        fs.rename( src, dest, function( err ) {
            if ( err ) {
                return write500( resp, "failed to upload image" );
            }

            io.sockets.emit( "update", { fileName : safeFileName } );

            resp.writeHead( 200, { "Content-Type":"application/json" } )
            resp.write( JSON.stringify( { "status":"complete" } ) );
            resp.end();
        });
    });
});


// get static files
app.get( /.*/, function( req, resp ) {
    console.log( 'requesting : ' + req.path );

    fileName = __dirname + '/public_html' + req.path;

    ( function( file ) {
        fs.stat( file, function( err, stats ) {

            if ( err ) {
                console.log( 'file not found' );
                return write404( resp, req.path + ' not found' );
            }

            if ( stats.isDirectory() ) {
                fs.readdir( file, function( err, files ) {
                    resp.writeHead( 200, {} )
                    resp.write( JSON.stringify( files ) );
                    resp.end();
                    return;
                });

            } else {

                fs.readFile( file, function( error, content ) {

                    if ( error ) {
                        return write404( resp, req.path + ' not found' );
                    } else {
                        resp.writeHead( 200, {
                            'Content-Type': mime.lookup(req.path)
                            })
                        resp.write( content );
                        resp.end();
                        return;
                    }
                });
            }
        })
    })( fileName );
});

io.sockets.on( "connection", function( socket ) {
    socket.emit( 'connected',  { } )
});

function write404( resp, message ) {
    resp.writeHead( 404, {} );
    resp.write( message );
    resp.end();
}

function write500( resp, message ) {
    resp.writeHead( 500, {} );
    resp.write( resp, "failed to upload image" );
    resp.end();
}

app.listen( 8080 );
