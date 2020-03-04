import React, { Component } from 'react';
import axios from 'axios';


const search = async (query, type, limit) => {
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
};

class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      type: 'artists',
      limit: 20,
      results: props.default,
      error: '',
      display: 'grid'
    };
  }

  async componentDidMount() {
    const firstSearch = await search('Drake', 'artists', 20);
    this.setState({ results: firstSearch });
  }

  render() {
    const { results } = this.state;
    return (
      <div className="container">
        {results.map((result, i) => <Card key={i.toString()} name={result.name} popularity={result.popularity} genres={result.genres} />)}
      </div>
    );
  }
}

export default Test;
