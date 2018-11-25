import React, { Component } from 'react';
import './App.scss';
import superagent from 'superagent';
import querystring from 'querystring';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: 'https://city-explorer-backend.herokuapp.com/',
      city: '',
      formatted_query: '',
      id: 0,
      latitude: '',
      longitude: '',
      search_query: '',
      weather: [],
      yelp: [],
      movies: [],
      meetups: [],
      trails: [],
      map: '',
    }
  }

  static getDerivedStateFromProps(props, state) {
    console.log(state);
  }
  
  handleChange = (event) => {
    this.setState({ 
      [event.target.name]: event.target.value,
    });
  }

  handleForm = async (event) => {
    event.preventDefault();
    try {
      let query = querystring.stringify({data: this.state.city});
      let results = await superagent('get', `${this.state.url}location?${query}`);
      await this.setState({
        city: encodeURIComponent(this.state.city),
        formatted_query: results.body.formatted_query,
        id: encodeURIComponent(results.body.id),
        latitude: encodeURIComponent(results.body.latitude),
        longitude: encodeURIComponent(results.body.longitude),
        search_query: encodeURIComponent(results.body.search_query),
        map: `https://maps.googleapis.com/maps/api/staticmap?center=${results.body.latitude}%2c%20${results.body.longitude}&zoom=13&size=600x300&maptype=roadmap%20%20&key=AIzaSyDp0Caae9rkHUHwERAFzs6WN4_MuphTimk`
      });

      await this.getResource('weather');
      await this.getResource('movies');
      await this.getResource('yelp');
      await this.getResource('meetups');
      await this.getResource('trails');
    }
    catch (err) {
      console.error(err);
    }
  }

  render() {
    return (
      <React.Fragment>
        <h1>City Explorer</h1>
        <form onSubmit={ this.handleForm }>
          <input
            placeholder='City, City/State, or Zip'
            name='city'
            value={ this.state.city }
            onChange={ this.handleChange } />
          <button>Explore!</button>
        </form>
        <h2>Here are the results for {this.state.formatted_query}</h2>
        <img class='map' src={this.state.map} />
        <section>
          <h3>Results from the Dark Sky API</h3>
          <ul>
            {
              this.state.weather.map( (result, index) => {
                return <li key = {index}>
                  The weather for {result.time} is {result.forecast}
                </li>
              })
            }
          </ul>
        </section>
        <section>
          <h3>Results from the Yelp API</h3>
          <ul>
            {
              this.state.yelp.map( (result, index) => {
                return <li key = {index}>
                  <a href={result.url}>{result.name}</a>
                  <p>The average rating is {result.rating} out of 5 and the average price is {result.price} out of $$$$.</p>
                  <p><img src={result.image_url} /></p>
                </li>
              })
            }
          </ul> 
        </section>
        <section>       
          <h3>Results from the Meetup API</h3>
            <ul>
              {
                this.state.meetups.map( (result, index) => {
                  return <li key = {index}>
                    <a href={result.link}>{result.name}</a>
                    <p>The host for this meetup is {result.host}</p>
                    <p>Created On {result.creation_date}</p>
                  </li>
                })
              }
            </ul>
          </section>
          <section>
            <h3>Results from the the Movie DB API</h3>
            <ul>
              {
                this.state.movies.map( (result, index) => {
                  return <li key = {index}>
                    <p><b>{result.title}</b> was released on {result.released_on}. Out of {result.total_votes} votes, {result.title} has an average of {result.average_votes} and a popularity of {result.popularity}</p>
                    <p><img src={result.image_url} /></p>
                    <p>{result.overview}</p>
                  </li>
                })
              }
            </ul>
          </section>
          <section>
            <h3>Results from the the Hiking Project API</h3>
            <ul>
              {
                this.state.trails.map( (result, index) => {
                  return <li key = {index}>
                    <p>Hike Name: <a href={result.trail_url}>{result.name}</a></p>
                    <p>Location: {result.location}</p>
                    <p>Hike length: {result.length} miles</p>
                    <p>On {result.condition_date} at {result.condition_time}, trail conditions were reported as {result.conditions}.</p>
                    <p>This trail has a rating of {result.stars} stars (out of {result.star_votes} votes.</p>
                    <p>{result.summary}</p>
                  </li>
                })
              }
            </ul>
          </section>
      </React.Fragment>
    );
  }

  getResource = async (resource) => {
    let result = await superagent(
      'get',
      `${this.state.url}${resource}?data[id]=${this.state.id}&data[search_query]=${this.state.city}&data[formatted_query]=${encodeURIComponent(this.state.formatted_query)}&data[latitude]=${this.state.latitude}&data[longitude]=${this.state.longitude}`
    );
    await this.setState({ [resource]: result.body });
  }
}

export default App;
