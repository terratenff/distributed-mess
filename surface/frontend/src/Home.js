import React, { Component } from 'react';
import './App.css';
import AppNavbar from './AppNavbar';

class Home extends Component {
    render() {
        return (
            <div>
                <AppNavbar/>
                <h2>Surface</h2>
                <p>TODO: Add cards that describe recent events.</p>
            </div>
        );
    }
}
export default Home;