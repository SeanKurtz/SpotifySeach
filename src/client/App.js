import React from 'react';
import axios from 'axios';
import Table from './components/Table';
import Card from './components/Card';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './app.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: 'singer-songwriter',
      loading: true,
      error: false,
      results: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    const { data } = await axios.get('http://localhost:8080/genre?query=%22singer-songwriter%22');
    if (data.success) {
      this.setState({ results: data.message, loading: false });
    }
  }

  handleChange(e) {
    console.log(e.target.value);
    this.setState({ query: e.target.value });
  }

  handleSubmit(e) {
    const { query, } = this.state;
    const queryStr = `http://localhost:8080/genre?query=%22${query}%22`;
    this.setState({ loading: true });
    axios.get(queryStr).then((res) => {
      const { data } = res;
      console.log(data);
      if (data.success) {
        this.setState({ results: data.message, loading: false, error: false });
      } else if (data.message.length === 0 || !data.success) {
        this.setState({ results: [], loading: false, error: true });
      }
    }).catch((err) => {
      console.log(err);
      this.setState({ results: [], loading: false, error: true });
    });
  }

  render() {
    const {
      results, query, loading, error
    } = this.state;
    let mainContent = <h4>...</h4>;
    if (loading) {
      mainContent = <h4>Loading...</h4>;
    } else if (error) {
      mainContent = <h4>No match.</h4>;
    } else {
      mainContent = (
        <div>
          <p>
            Found
            {' '}
            {' '}
            {results.length}
            {' '}
            exact matches.
          </p>
          <Card items={results} />
        </div>
      );
    }
    return (
      <div className="w-90 mx-auto" style={{ width: '95%' }}>
        <form className="mt-4 mb-4">
          <div className="form-row w-50">
            <div className="form-group col-md-4">
              <select className="form-control">
                <option>Genre</option>
                <option>Artist</option>
                <option>Artists</option>
              </select>
            </div>
            <div className="form-group col md-8">
              <input className="form-control" onChange={this.handleChange} value={query} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-4">
              <button className="btn btn-primary m-1" type="button" onClick={this.handleSubmit}>Submit</button>
              <button className="btn btn-primary" type="button">Download as CSV</button>
            </div>
          </div>
        </form>
        {mainContent}
      </div>
    );
  }
}

export default App;
