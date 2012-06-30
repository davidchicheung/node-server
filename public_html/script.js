// Image Carousel Setup
$( document ).ready( function() {
    $.ajax({
        url: "img/",
        dataType: 'json',
        success: function( data ) {          
            for ( i in data ) {
                var image = data[i];
                var carouselImage;
                var thumbnail;
                
                if ( i == 0 ) {
                    carouselImage = 
                            [ "<div class='active item'><img alt='' src='img/",
                              encodeURI( image ),
                              "'></div"
                            ].join( "" ) ;
                } else {
                    carouselImage = 
                            [ "<div class='item'><img alt='' src='img/",
                              encodeURI( image ),
                              "'></div"
                            ].join( "" );
                }
                
                $( ".carousel-inner" ).append( carouselImage );

                thumbnail = 
                        [ "<li><a class='thumbnail' onclick='imageToCarousel(",
                          i,
                          ")'><img src='img/",
                          image,
                          "'/></a></li>"
                        ].join( "" );

                $( "ul.thumbnails" ).append( thumbnail );
            }
        }
    });
    
    $( '#mainCarousel' ).carousel({
        interval: 5000,
    });
});

function imageToCarousel( index ) {
    $( "#mainCarousel" ).carousel( index );
}

// HTML5 Drag & Drop Setup
var dropZone = document.getElementById( "dropZone" );

dropZone.addEventListener( "dragleave", dragLeave, false );
dropZone.addEventListener( "dragover", dragEnter, false );
dropZone.addEventListener( "drop", drop, false );

function stopEvent( e ) {
    e.stopPropagation();
    e.preventDefault();
}

function dragEnter( e ) {
    stopEvent( e );
    dropZone.style.border = "1px solid #0088CC";
}

function dragLeave( e ) {
    stopEvent( e );
    dropZone.style.border = "1px dashed #BBBBBB";
}

function drop( e ) {
    stopEvent( e );
    dropZone.style.border = "1px dashed #BBBBBB";
                
    upload( e.dataTransfer.files );
}

// Image Upload Setup
function addImageToThumbnails( fileName ) {
    var count = $( "ul.thumbnails li" ).length;
    
    var thumbnail = 
            [ "<li><a class='thumbnail' onclick='imageToCarousel(",
              count,
              ")'><img src='img/",
              fileName,
              "'/></a></li>",
              $( "ul.thumbnails" ).html()
            ].join( "" );

    $( "ul.thumbnails" ).html( thumbnail );
}

function addImageToCarousel( fileName ) {
    $( ".item" ).removeClass( "active" );

    var thumbnail = 
            [ "<div class='active item'><img alt='' src='img/",
              encodeURI( fileName ),
              "'></div>"
            ].join( "" );

    $( ".carousel-inner" ).append( thumbnail );
}

function upload( files ) {
    var i;
    for ( i = 0; i < files.length; i++ ) {
        var file = files[i];
        
        var formData = new FormData();
        formData.append( "image", file );

        var xhr = new XMLHttpRequest();
        xhr.open( "POST", "upload/", true );
        xhr.onreadystatechange = function() {
            if ( xhr.readyState == 4 ) {
                addImageToThumbnails( fileName );
                addImageToCarousel( fileName );
            }          
        };
        xhr.send( formData );
    }
}

// Image Server Push Setup
var socket = io.connect( 'http://localhost:3000' );

socket.on('update', function ( data ) {
    addImageToThumbnails( data.fileName );
    addImageToCarousel( data.fileName );
});