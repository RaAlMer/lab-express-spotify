require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
//Concatenation function for handlebars
hbs.registerHelper('concat', function () {
    let outStr = '';
    for (let arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      };
    };
    return outStr;
});

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});
// Retrieve an access token
spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:
app.get('/', (req, res) => {
    res.render('index', {title: 'Home'});
});

//Searching artists
app.get('/artist-search', (req, res) => {
    spotifyApi
        .searchArtists(req.query.artist)
        .then(data => {
            //console.log('The received data from the API: ', data.body);
            let artistSearch = data.body.artists.items;
            res.render('artist-search-results', {title: 'Artist search', artistSearch});
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
});

//Searching albums
app.get('/albums/:artistId', (req, res) => {
    const id = req.params.artistId;
    spotifyApi
        .getArtistAlbums(id)
        .then(async data => {
            //console.log(data.body);
            let albumsSearch = data.body.items;
            const artistData = await spotifyApi.getArtist(req.params.artistId);
            res.render('albums', {title: 'Albums', albumsSearch, artistName: artistData.body.name});
        })
        .catch(err => console.log('The error while searching albums occurred: ', err));
});

//Searching tracks
app.get('/tracks/:tracksId', (req, res) => {
    spotifyApi
      .getAlbumTracks(req.params.tracksId)
      .then(data => {
        //console.log('The received data from the API: ', data.body.items);
        let tracksSearch = data.body.items;
        res.render('tracks-info', {title: 'Tracks', tracksSearch});
      })
      .catch(err => console.log('The error while searching tracks occurred: ', err));
  });

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
