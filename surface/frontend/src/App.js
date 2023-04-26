import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import Home from './Home';
import ShipList from './ShipList';
import ShipEdit from './ShipEdit';
import MissionControl from './MissionControl';
import MissionLog from './MissionLog';
import About from './About';
import AssignMission from './mission_control/AssignMission';

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
    return (
        <div className="App">
          <Router>
            <Routes>
              <Route path="/" exact={true} element={<Home/>}/>
              <Route path="/shipyard" exact={true} element={<ShipList/>}/>
              <Route path="/shipyard/:id" exact={true} element={<ShipEdit/>}/>
              <Route path="/mission-control" exact={true} element={<MissionControl/>}/>
              <Route path="/mission-control/:id" exact={true} element={<AssignMission/>}/>
              <Route path="/mission-log" exact={true} element={<MissionLog/>}/>
              <Route path="/about" exact={true} element={<About/>}/>
            </Routes>
          </Router>
        </div>
    );
  }
}

export default App;
