const axios = require('axios');

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


const getToken = () => new Promise((resolve, reject) => {
  axios(authRequest).then(res => resolve({ data: { ...res.data } })).catch(err => reject(err));
});

// VALID TYPES ARE album, artist, playlist, and track.
const search = (token, query, type, limit, offset) => new Promise((resolve, reject) => {
  const accessToken = `Bearer ${token}`;
  axios.get(`https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=${limit}&offset=${offset}`, { headers: { Authorization: accessToken } }).then(res => resolve({ ...res.data })).catch(err => reject(err));
});


module.exports = { getToken, search };
