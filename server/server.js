var express = require('express');
var session = require('express-session');
var compression = require('compression');
var path = require('path');

var app = express();
var servingFolder = "/../public_html"

app.use(compression());
app.use(
    session({
        secret: 'provide_here_random_string',
        resave: false,
        saveUninitialized: false
    })
);

app.use(express.static(__dirname + servingFolder))

/**
 * Angular HTML5 mode
 */
app.get("*", function(req, res, next) {
    var ignoredURLS = ['/css', '/static', '/app', '/bower'];
    for (var i = 0; i < ignoredURLS.length; i++) {
        if (req.url.indexOf(ignoredURLS[i]) === 0) {
            return next();
        }
    }

    res.sendFile(path.resolve(__dirname + servingFolder + '/index.html'));
});

var port = process.env.PORT || 8080;
app.listen(port);
console.log("Angular bootstrap project started in " + port);
