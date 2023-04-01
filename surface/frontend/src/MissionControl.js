import { Component } from "react";
import { Button, ButtonGroup, Container, Table } from 'reactstrap';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import AppNavbar from "./AppNavbar";
import spaceship from './images/spaceship.png';

class MissionControl extends Component {

    constructor(props) {
        super(props);
        this.state = {ships: []};
    }

    componentDidMount() {
        fetch('/ships')
            .then(response => response.json())
            .then(data => this.setState({ships: data}));
    }

    async destination(id) {
        // TODO
    }

    async launch(id) {
        // TODO
    }

    async repair(id) {
        // TODO
    }

    async decommission(id) {
        // TODO
    }

    async abort(id) {
        // TODO
    }

    render() {
        const {ships} = this.state;

        const shipList = ships.map(ship => {
            return <tr key={ship.id}>
                <td><img src={spaceship} alt="spaceship.png"></img><br/>{ship.status}</td>
                <td>{ship.name}<br/>{ship.condition} / {ship.peakCondition}<br/>Insert ship description here.</td>
                <td>-</td>
                <td>-</td>
                <td>
                    <ButtonGroup>
                        <Button size="sm" color="primary" tag={Link} to={"/shipyard/" + ship.id}>Edit</Button>
                        <Button size="sm" color="danger" onClick={() => this.remove(ship.id)}>Delete</Button>
                    </ButtonGroup>
                </td>
            </tr>
        });

        return (
            <div>
                <AppNavbar/>
                <Container fluid>
                    <h3>Mission Control</h3>
                    <div>
                        <Button color="primary" tag={Link} to="/mission-control">Send All Ships</Button>
                        <Button color="danger" tag={Link} to="/mission-control">Abort All Takeoffs</Button>
                        <Button color="warning" tag={Link} to="/mission-control">Recall All Ships</Button>
                        <Button color="danger" tag={Link} to="/mission-control">Abort All Landings</Button>
                    </div>
                    <Table borderless hover>
                        <thead>
                        <tr>
                            <th width="20%">Status</th>
                            <th width="20%">Details</th>
                            <th width="20%">Current Destination</th>
                            <th width="20%">Time Since Departure</th>
                            <th width="20%">Controls</th>
                        </tr>
                        </thead>
                        <tbody>
                        {shipList}
                        </tbody>
                    </Table>
                    </Container>
            </div>
        );
    }
}

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        return (
            <Component
                {...props}
                router={{ location, navigate, params }}
            />
        );
    }
  
    return ComponentWithRouterProp;
  }

export default withRouter(MissionControl);