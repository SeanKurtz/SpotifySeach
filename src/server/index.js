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

const getToken = async () => {
  const response = await axios(authRequest);
  const newToken = `Bearer ${response.data.access_token}`;
  console.log('Received a new access token.');
  return newToken;
};

let token = '';
token = getToken();


app.use(express.static('dist'));

// MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/artistId', async (req, res) => {
  const { query } = req.query;
  let actualQuery = '';
  if (query.includes(':')) {
    actualQuery = query.substr(query.lastIndexOf(':') + 1, query.length);
  } else {
    actualQuery = query;
  }
  console.log(actualQuery);
  token = await getToken();
  axios.get(`https://api.spotify.com/v1/artists/${actualQuery}`, { headers: { Authorization: token } })
    .then((result) => {
      console.log(result.data);
      const item = {
        name: result.data.name,
        popularity: result.data.popularity,
        followers: result.data.followers.total,
        id: result.data.id,
        genres: result.data.genres
      };
      res.json({ success: true, message: item, total: 1 });
    })
    .catch(err => res.json({ success: false, message: err }));
});
app.get('/artist', async (req, res) => {
  const { query } = req.query;
  console.log(`Received query for: ${query}`);

  // Refresh authorization token.
  token = await getToken();

  // Create a request for the first page.
  const getFirstPage = axios.get(`https://api.spotify.com/v1/search?q=${query}&type=artist&limit=50`, { headers: { Authorization: token } });

  const totalItems = [];

  getFirstPage.then((result) => {
    const { data } = result;
    const { artists } = data;
    const { total } = artists;
    // Save results from first page.
    totalItems.push(...artists.items);

    // Generate requests for rest of pages based on total field of first requests response.
    const requests = [];
    for (let i = 50; i <= total && i <= 1950; i += 50) {
      requests.push(axios.get(`https://api.spotify.com/v1/search?q=${query}&type=artist&limit=50&offset=${i}`, { headers: { Authorization: token } }));
    }
    Promise.all(requests).then((responses) => {
      responses.forEach((response) => {
        const responseArtistsItems = response.data.artists.items;
        totalItems.push(...responseArtistsItems);
      });
      console.log(`Finshed requests, found ${totalItems.length} items`);

      // Make sure our filter string doesn't have quotes.
      const queryStr = query.replace(/['"]+/g, '');
      // Remove inexact matches.
      const filteredItems = totalItems;
      console.log(`Exactly matched ${filteredItems.length} items`);
      // Remove unnecessary data.
      filteredItems.sort((a, b) => b.popularity - a.popularity);
      const smallerItems = filteredItems.map(item => (
        {
          name: item.name,
          popularity: item.popularity,
          id: item.id,
          followers: item.followers.total,
          genres: item.genres
        }
      ));
      console.log(`Sending ${smallerItems.length} items to client`);
      if (smallerItems.length > 0) {
        res.json({ success: true, message: smallerItems, total });
      } else {
        res.json({ success: false, message: 'No matches.' });
      }
    });
  });
});
app.get('/genre', async (req, res) => {
  const { query } = req.query;
  let formattedQuery = query.toString();
  if (formattedQuery.replace(/["]/g, '') === 'r&b') {
    formattedQuery = formattedQuery.replace(/["']/g, '');
    formattedQuery = formattedQuery.replace(/&/g, '%26');
  } else if (formattedQuery.includes('r&b')) {
    formattedQuery = formattedQuery.replace(/&/g, '%26');
  }

  console.log(`Received query for: ${formattedQuery}`);

  // Refresh authorization token.
  token = await getToken();

  // Create a request for the first page of data.
  const getFirstPage = axios.get(`https://api.spotify.com/v1/search?q=genre:${formattedQuery}&type=artist&limit=50`, { headers: { Authorization: token } });
  const totalItems = [];

  getFirstPage.then((result) => {
    const { data } = result;
    const { artists } = data;
    const { total } = artists;

    console.log(total);
    // Save results from first page.
    totalItems.push(...artists.items);

    // Generate requests for rest of pages based on total field of first requests response.
    const requests = [];
    for (let i = 50; i <= total && i <= 1950; i += 50) {
      requests.push(axios.get(`https://api.spotify.com/v1/search?q=genre:${formattedQuery}&type=artist&limit=50&offset=${i}`, { headers: { Authorization: token } }));
    }
    // When all of those requests are complete
    Promise.all(requests).then((responses) => {
      responses.forEach((response) => {
        const responseArtistsItems = response.data.artists.items;
        totalItems.push(...responseArtistsItems);
      });
      console.log(`Finshed requests, found ${totalItems.length} items`);

      // Make sure our filter string doesn't have quotes.

      console.log(query);
      const queryStr = query.replace(/["']/g, '');

      // Remove inexact matches and items with empty genres.
      const filteredItems = totalItems.filter(item => item.genres.includes(queryStr) && item.genres.length !== 0);
      console.log(`Exactly matched ${filteredItems.length} items`);
      // Remove unnecessary data.
      filteredItems.sort((a, b) => b.popularity - a.popularity);
      const smallerItems = filteredItems.map(item => (
        {
          name: item.name,
          popularity: item.popularity,
          id: item.id,
          followers: item.followers.total,
          genres: item.genres
        }
      ));
      // Move selected genre to front.
      for (let i = 0; i < smallerItems.length; i += 1) {
        const genreIndex = smallerItems[i].genres.indexOf(queryStr);
        // eslint-disable-next-line prefer-destructuring
        smallerItems[i].genres[genreIndex] = smallerItems[i].genres[0];
        smallerItems[i].genres[0] = queryStr;
      }
      console.log(`Sending ${smallerItems.length} items to client`);
      if (smallerItems.length > 0) {
        res.json({ success: true, message: smallerItems, total });
      } else {
        res.json({ success: false, message: 'No matches.' });
      }
    }).catch(err => res.json({ success: false, message: err }));
  }).catch(err => res.json({ success: false, message: err }));
});

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
