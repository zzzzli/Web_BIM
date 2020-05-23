var express = require('express');           // For web server
var Axios = require('axios');               // A Promised base http client
var bodyParser = require('body-parser');    // Receive JSON format

// Set up Express web server
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));

// This is for web server to start listening to port 3000
app.listen(process.env.PORT || 3000, function () {
    console.log('Server listening on port 3000');
});

//-------------------------------------------------------------------
// Configuration for your Forge account
// Initialize the 2-legged OAuth2 client, and
// set specific scopes
//-------------------------------------------------------------------
var FORGE_CLIENT_ID = 'AcDpwwfJw8Zksc0MbINlIbl595P0wavQ';
var FORGE_CLIENT_SECRET = '72nJf9zB9GxRdzJj';
var access_token = '';
var scopes = 'data:read viewables:read data:write data:create bucket:create bucket:read';  // set the scopes to specify access privilege.
const querystring = require('querystring'); // convert our data to the required format.

// Axios.defaults.maxContentLength = Infinity;
// Axios.defaults.maxBodyLength = Infinity;

app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html");
})

// Route /api/forge/oauth/public
app.get('/api/forge/oauth/public', function (req, res) {
    // Limit public token to Viewer read only
    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/authentication/v1/authenticate',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: querystring.stringify({
            client_id: FORGE_CLIENT_ID,
            client_secret: FORGE_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'viewables:read'
        })
    })
        .then(function (response) {
            // Success
            // console.log("token to viewer");
            // console.log(response);
            // console.log(response.data.access_token);
            res.json({ access_token: response.data.access_token, expires_in: response.data.expires_in });
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.status(500).json(error);
        });
});
