import React from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import Table from './components/Table';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './app.css';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      type: 'genre',
      startup: true,
      loading: false,
      error: false,
      results: [],
      total: 0
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const { target } = event;
    const { value, name } = target;
    this.setState({
      [name]: value
    });
  }


  handleSubmit(event) {
    event.preventDefault();
    const { query, type } = this.state;
    console.log(type);
    this.setState({ loading: true });

    let queryStr = `http://localhost:8080/genre?query=%22${query.toLowerCase()}%22`;
    if (type === 'artist') {
      queryStr = `http://localhost:8080/${type}?query=${query}`;
    }
    axios.get(queryStr).then((res) => {
      const { data } = res;
      console.log(data);
      if (data.success) {
        this.setState({
          results: data.message, loading: false, error: false, total: data.total, startup: false
        });
      } else if (data.message.length === 0 || !data.success) {
        this.setState({
          results: [], loading: false, error: true, total: data.total
        });
      }
    }).catch((err) => {
      console.log(err);
      this.setState({ results: [], loading: false, error: true });
    });
  }

  render() {
    const {
      results, query, loading, error, type, total, startup
    } = this.state;

    const data = results.slice(0);
    const formattedData = data.map((item) => {
      const newFollowers = item.followers.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
      return (
        {
          name: item.name,
          popularity: item.popularity,
          followers: newFollowers,
          id: item.id,
          genres: item.genres.join(', ')
        }
      );
    });
    const headers = [
      { label: 'Name', key: 'name' },
      { label: 'Popularity', key: 'popularity' },
      { label: 'Followers', key: 'followers' },
      { label: 'Spotify Id', key: 'id' },
      { label: 'Genres', key: 'genres' },
    ];

    let csvButton = <button className="btn btn-secondary" type="button">Download as CSV</button>;
    if (!loading && !error && !startup) {
      csvButton = <CSVLink data={formattedData} headers={headers} filename={`${type}-search.csv`} className="btn btn-primary">Download as CSV</CSVLink>;
    }


    let mainContent = <h4>...</h4>;
    if (loading) {
      mainContent = <h4>Loading...</h4>;
    } else if (error) {
      mainContent = <h4>No matches...</h4>;
    } else if (startup) {
      mainContent = (
        <h4>
          Welcome to Spotify Search. Enter a genre or select artist from dropdown and enter an artist to begin. Please note that artist names are case-sensitive.
          {' '}
        </h4>
      );
    } else {
      mainContent = (
        <div>
          <h4>
            Found
            {' '}
            {' '}
            {results.length}
            {' '}
            exact matches out of
            {' '}
            {' '}
            {total}
            {' '}
            {' '}
            total items in search results.
          </h4>
          <Table items={results} />
        </div>
      );
    }

    return (
      <div className="w-90 mx-auto" style={{ width: '95%' }}>
        <div className="w-75">
          <h1 className="mt-2">Spotify Search</h1>
          <form className="mt-4 mb-4" onSubmit={this.handleSubmit}>
            <div className="form-row w-50">
              <div className="form-group col-md-4">
                <select className="form-control" value={type} name="type" onChange={this.handleChange}>
                  <option value="genre">Genre</option>
                  <option value="artist">Artist</option>
                </select>
              </div>
              <div className="form-group col md-8">
                <input className="form-control" onChange={this.handleChange} value={query} name="query" placeholder={type === 'genre' ? 'soft rock' : 'Maroon 5'} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-4">
                <button className="btn btn-primary m-1" type="submit">Submit</button>
                {csvButton}
              </div>
            </div>
          </form>
        </div>
        <div>
          {mainContent}
        </div>
      </div>
    );
  }
}

export default App;
