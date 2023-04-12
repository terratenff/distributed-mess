import { Component } from "react";
import { Button, ButtonGroup, Container, UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem } from 'reactstrap';
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

    async mission(id) {
        console.log("TODO");
    }

    async launch(id) {
        console.log("TODO");
    }

    async repair(id) {
        console.log("TODO");
    }

    async decommission(id) {
        console.log("TODO");
    }

    async abort(id) {
        console.log("TODO");
    }

    render() {
        const {ships} = this.state;

        const shipList = ships.map(ship => {
            return <AccordionItem key={ship.id}>
                <AccordionHeader targetId={ship.id}>
                    <p style={{margin: 0, width: 10 + "%"}}>{ship.status}</p>
                    <p style={{margin: 0, width: 25 + "%"}}>{ship.name}</p>
                    <p style={{margin: 0, width: 5 + "%"}}>{ship.condition} / {ship.peakCondition}</p>
                    <div style={{margin: 0, width: ship.condition + "px", height: 12 + "px", backgroundColor: "green"}}></div>
                    <div style={{margin: 0, width: (ship.peakCondition - ship.condition) + "px", height: 12 + "px", backgroundColor: "red"}}></div>
                </AccordionHeader>
                <AccordionBody accordionId={ship.id}>
                    <div style={{display: "inline-flex", float: "left"}}>
                        <img src={spaceship} alt="spaceship.png"></img>
                        <div style={{width: 60 + "%"}}>
                            <p style={{margin: 0, textAlign: "left"}}>{ship.name}</p>
                            <p style={{margin: 0, textAlign: "left"}}>ID: {ship.id}</p>
                            <p style={{margin: 0, textAlign: "left"}}>Current Status: {ship.status}</p>
                            <p style={{margin: 0, textAlign: "left"}}>Current Condition: {ship.condition} / {ship.peakCondition}</p>
                        </div>
                        <p style={{margin: 0, textAlign: "left"}}>Insert ship description here.</p>
                    </div>
                    <ButtonGroup vertical style={{float: "right"}}>
                        <Button size="sm" color="primary" onClick={() => this.mission(ship.id)}>Assign Mission</Button>
                        <Button size="sm" color="success" onClick={() => this.launch(ship.id)}>Launch Ship</Button>
                        <Button size="sm" color="secondary" onClick={() => this.repair(ship.id)}>Conduct Repairs</Button>
                        <Button size="sm" color="warning" onClick={() => this.abort(ship.id)}>Abort Mission</Button>
                        <Button size="sm" color="danger" onClick={() => this.decommission(ship.id)}>Decommission Ship</Button>
                    </ButtonGroup>
                </AccordionBody>
            </AccordionItem>
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
                    <UncontrolledAccordion flush open="false">
                        {shipList}
                    </UncontrolledAccordion>
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