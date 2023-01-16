import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import Home from './Home';
import ShipList from './ShipList';
import ShipEdit from './ShipEdit';

class App extends Component {
  state = {
    ships: []
  };

  async componentDidMount() {
    const response = await fetch('/ships');
    const body = await response.json();
    this.setState({ships: body});
  }

  render() {
    const {ships} = this.state;
    return (
        <div className="App">
          <Router>
            <Routes>
              <Route path="/" exact={true} element={<Home/>}/>
              <Route path="/ships" exact={true} element={<ShipList/>}/>
              <Route path="/ships/:id" exact={true} element={<ShipEdit/>}/>
            </Routes>
          </Router>
          <header className="App-header">
            <div className="App-intro">
              <h2>Ships</h2>
              {ships.map(ship =>
                  <div key={ship.id}>
                    {ship.name} | {ship.status} ({ship.condition} / {ship.peakCondition})
                  </div>
              )}
            </div>
          </header>
        </div>
    );
  }
}

export default App;
