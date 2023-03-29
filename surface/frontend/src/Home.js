import React, { Component } from 'react';
import './App.css';
import AppNavbar from './AppNavbar';
//import { Link } from 'react-router-dom';
//import { Button, Container } from 'reactstrap';
//
//<Container fluid>
//	<Button color="link"><Link to="/ships">Ships</Link></Button>
//</Container>

class Home extends Component {
    render() {
        return (
            <div>
                <AppNavbar/>
            </div>
        );
    }
}
export default Home;