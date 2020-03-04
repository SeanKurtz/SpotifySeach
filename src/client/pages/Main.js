import React, { Component } from 'react';
import axios from 'axios';
import Card from '../components/Card';

const SpotifyApi = {
  searchArtists(query, limit) {
    return new Promise((resolve, reject) => {
      axios.get(`http://localhost:8080/search?query=${query}&type=artist&limit=${limit}`).then(res => resolve(res.data)).catch(err => reject(err));
    });
  },
  searchArtist(query) {
    return new Promise((resolve, reject) => {
      axios.get(`http://localhost:8080/artist?query=${query}&type=artist`).then(res => resolve(res.data)).catch(err => reject(err));
    });
  },
  searchGenre(query) {
    return new Promise((resolve, reject) => {
      axios.get(`http://localhost:8080/genre?query=${query}&type=artist`).then(res => resolve(res.data)).catch(err => reject(err));
    });
  },
  async search(query, type, limit, offset) {
    let results = [];
    switch (type) {
      default:
        return results;
      case 'artists':
        results = (await axios.get(`http://localhost:8080/search?query=${query}&type=artist&limit=${limit}`));
        break;
      case 'artist':
        results = await axios.get(`http://localhost:8080/artist?query=${query}&type=artist`);
        break;
      case 'genre':
        results = await axios.get(`http://localhost:8080/genre?query=${query}&type=artist`);
        break;
    }
    return results;
  }
};

export default class Main extends Component {
  constructor() {
    super();
    this.state = {
      query: '',
      type: 'artists',
      limit: 20,
      results: [],
      error: '',
      display: 'grid'
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    SpotifyApi.searchArtists('Drake', 20).then(res => this.setState({ results: res }));
  }


  handleChange(event) {
    const { target } = event;
    const { value } = target;
    console.log(target.value);
    if (target.name === 'query') {
      this.setState({ query: value });
    }
    if (target.name === 'type') {
      console.log(`Setting option to: ${value}`);
      this.setState({ type: value });
    }
    if (target.name === 'display') {
      console.log(`Setting option to: ${value}`);
      this.setState({ display: value });
    }
  }

  handleSubmit(event) {
    const { target } = event;
    const { query, type, limit } = this.state;
    console.log(`Submitting for search: ${query}`);
    if (target.name === 'searchButton') {
      console.log('Preparing to query');
      if (type === 'artist') {
        console.log('searching for specific artist');
        SpotifyApi.searchArtist(query).then((res) => {
          console.log(res);
          if (res.success) {
            this.setState({ results: res.message, error: '' });
          } else {
            this.setState({ error: res.message });
          }
        });
      }
      if (type === 'artists') {
        SpotifyApi.searchArtists(query, limit).then((res) => {
          console.log('Fetched new artists, setting state...');
          console.log(res);
          this.setState({ results: res });
        });
      }
      if (type === 'genre') {
        console.log('Searching by genre');
        SpotifyApi.searchGenre(query).then((res) => {
          console.log(res.message);
          if (res.success && res.message.length > 0) {
            const artists = res.message;
            this.setState({ results: artists, error: '' });
          } else {
            this.setState({ error: res.message });
          }
        });
      }
    }
  }

  render() {
    const {
      results, query, error, display, type
    } = this.state;
    let placeholder = '';
    switch (type) {
      default:
        placeholder = 'Default error';
        break;
      case 'artist':
        placeholder = 'Input artist name';
        break;
      case 'artists':
        placeholder = 'Input name of artist to search for';
        break;
      case 'genre':
        placeholder = 'Input genre of artists to search for';
        break;
    }

    return (
      <div className="app">
        <div className="form">
          <div className="options">
            <div className="option">
              <h4 className="gutter">Type</h4>
              <select className="gutter" name="type" onChange={this.handleChange}>
                <option value="artists">Artists</option>
                <option value="artist">Artist</option>
                <option value="genre">Genre</option>
              </select>
            </div>
            <div className="option">
              <h4 className="gutter">Display</h4>
              <select className="gutter" name="display" onChange={this.handleChange}>
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>
          </div>
          <h4 className="gutter">Query</h4>
          <input className="block gutter" type="text" name="query" placeholder={placeholder} onChange={this.handleChange} value={query} />
          <button type="button" name="searchButton" onClick={this.handleSubmit}>Submit</button>
        </div>
        <div className="err">
          {error === '' ? <br /> : (
            <div className="error">
              <p>
                Search failed:
                {' '}
                {error}
              </p>
            </div>
          )}
        </div>
        <div className="cards">
          {results.map((result, i) => <Card key={i} name={result.name} popularity={result.popularity} genres={result.genres} display={display} />)}
        </div>
      </div>
    );
  }
}
