const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();


const CLIENT_ID = 'a6080684b3244d5e8e92d272a05dd557';
const CLIENT_SECRET = 'c031dec941344634acb13ea03e0117e4';

const authRequest = {
  url: 'https://accounts.spotify.com/api/token',
  method: 'post',
  params: {
    grant_type: 'client_credentials'
  },
  headers: {
    Accept: 'application/json',
    'Conent-Type': 'application/x-www-form-urlencoded'
  },
  auth: {
    username: CLIENT_ID,
    password: CLIENT_SECRET
  }
};


let token = null;
axios(authRequest).then((res) => {
  const accessToken = res.data.access_token;
  token = `Bearer ${accessToken}`;
  console.log(token);
});


app.use(express.static('dist'));

// MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


app.get('/search', (req, res) => {
  console.log(req.query);
  const { query, type, limit } = req.query;
  search(token, query, type, limit).then((response) => {
    if (type === 'artist') {
      console.log(response);
      const { items } = response.artists;
      const newItems = items.map(item => (
        { name: item.name, popularity: item.popularity, genres: item.genres }
      ));
      res.json(newItems);
    }
  });
});

app.get('/artist', (req, res) => {
  const { query } = req.query;
  search(token, query, 'artist', 1).then((response) => {
    // If we didn't have an exact match on this route, we return an error message.
    const { items } = response.artists;
    if (items.length === 0) {
      res.json({ success: false, message: 'No artists' });
    }
    const { name } = items[0];
    if (name !== query) {
      res.json({ success: false, message: 'Not an exact match' });
    }
    res.json({
      success: true, message: items
    });
  });
});

app.get('/genre', (req, res) => {
  const { query } = req.query;
  console.log(query);
  const getFirstPage = axios.get(`https://api.spotify.com/v1/search?q=genre:${query}&type=artist&limit=50`, { headers: { Authorization: token } });
  const totalItems = [];
  getFirstPage.then((result) => {
    const { data } = result;
    const { artists } = data;
    const { total } = artists;
    console.log(total);
    totalItems.push(...artists.items);
    const requests = [];
    for (let i = 50; i < 2000; i += 50) {
      requests.push(axios.get(`https://api.spotify.com/v1/search?q=genre:${query}&type=artist&limit=50&offset=${i}`, { headers: { Authorization: token } }));
    }
    Promise.all(requests).then((responses) => {
      const finalItems = [];
      finalItems.push(...totalItems);
      console.log(finalItems.length);
      responses.forEach((response) => {
        console.log(response.data.artists);
        const responseArtistsItems = response.data.artists.items;
        finalItems.push(...responseArtistsItems);
      });
      console.log(`Finshed requests, found ${finalItems.length} items`);

      // Make sure our filter string doesn't have quotes.
      const queryStr = query.replace(/['"]+/g, '');
      // Remove inexact matches.
      const filteredItems = finalItems.filter(item => item.genres.includes(queryStr));
      console.log(`Filtered items array contains ${filteredItems.length} items`);
      // Remove unnecessary data.
      const smallerItems = filteredItems.map(item => (
        {
          name: item.name, popularity: item.popularity, id: item.id, followers: item.followers.total, genres: item.genres
        }
      ));
      // Move selected genre to front.
      for (let i = 0; i < smallerItems.length; i += 1) {
        const genreIndex = smallerItems[i].genres.indexOf(queryStr);
        smallerItems[i].genres[genreIndex] = smallerItems[i].genres[0];
        smallerItems[i].genres[0] = queryStr;
      }
      console.log(`Sending ${smallerItems.length} items to client`);
      if (smallerItems.length > 0) {
        res.json({ success: true, message: smallerItems });
      } else {
        res.json({ success: false, message: 'No matches.' });
      }


      /*
      const sortedItems = filteredItems.sort((a, b) => b.popularity - a.popularity);
      const smallerItems = filteredItems.map(item => (
        {
          name: item.name, popularity: item.popularity, id: item.id, followers: item.followers.total, genres: item.genres
        }
      ));
      for (let i = 0; i < sortedItems.length; i += 1) {
        const genreIndex = smallerItems[i].genres.indexOf(queryStr);
        smallerItems[i].genres[genreIndex] = smallerItems[i].genres[0];
        smallerItems[i].genres[0] = queryStr;
      }
      */
    }).catch(err => res.json({ success: false, message: err }));
  }).catch(err => res.json({ success: false, message: err }));
});

/*
app.get('/genrespecific', (req, res) => {
  const { query } = req.query;
  const queryStr = query.replace(/['"]+/g, '');
  console.log(query);
  axios.get(`https://api.spotify.com/v1/search?q=genre:${query}&type=artist&limit=50`, { headers: { Authorization: token } }).then((response) => {
    const { data } = response;
    console.log(data);
    const { artists } = data;
    const { items, total } = artists;
    const requests = [];
    const totalItems = [];
    for (let i = 50; i <= total || i <= 2000; i += 50) {
      requests.push(axios.get(`https://api.spotify.com/v1/search?q=genre:${query}&type=artist&limit=50&offset=${i}`, { headers: { Authorization: token } }));
    }
    totalItems.push(...items);
    axios.all(requests).then(axios.spread((...responses) => {
      responses.map(itemResponse => (
        totalItems.push(...itemResponse.data.artists.items)
      ));
      // Removing all artists without SPECIFIC genre
      const filteredItems = totalItems.filter(totalItemsItem => totalItemsItem.genres.includes(queryStr));

      // Removing all extra data from artist objects.
      const smallerItems = filteredItems.map((filteredItemsItem => (
        {
          name: filteredItemsItem.name, popularity: filteredItemsItem.popularity, id: filteredItemsItem.id, followers: filteredItemsItem.followers, genres: filteredItemsItem.genres
        }
      )));

      // Sorting artists based on popularity from greatest to least.
      const sortedItems = smallerItems.sort((a, b) => b.popularity - a.popularity);

      // Moving the searched genre to front of genre list.
      for (let i = 0; i < sortedItems.length; i += 1) {
        const genreIndex = sortedItems[i].genres.indexOf(queryStr);
        sortedItems[i].genres[genreIndex] = sortedItems[i].genres[0];
        sortedItems[i].genres[0] = queryStr;
      }
      res.json({ success: true, message: sortedItems });
    })).catch(err => res.json({ success: false, message: err }));
  }).catch(err => res.json({ success: false, message: err }));
});
*/

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
