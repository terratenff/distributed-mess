import { Component } from "react";
import { Button, ButtonGroup, Container, UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem } from 'reactstrap';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import AppNavbar from "./AppNavbar";
import spaceship from './images/spaceship.png';

class MissionControl extends Component { // TODO: Change to functional paradigm.

    constructor(props) {
        super(props);
        this.state = {ships: []};
    }

    componentDidMount() {
        fetch('/ships')
            .then(response => response.json())
            .then(data => this.setState({ships: data}));
    }

    async launch(id) {
        console.log("TODO");
    }

    async repair(id) {
        fetch("/ships/" + id + "/repair");
        fetch('/ships')
            .then(response => response.json())
            .then(data => this.setState({ships: data}));
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
            const optsM = {"disabled": (ship.status === "READY" ? false : true)};
            const optsL = {"disabled": (ship.status === "READY" && ship.mission !== null ? false : true)};
            const optsR = {"disabled": ((ship.status === "READY" || ship.status === "BROKEN") && ship.condition < ship.peakCondition ? false : true)};
            const optsA = {"disabled": (ship.status === "TAKING_OFF" || ship.status === "OUTBOUND" || ship.status === "ACTIVE" ? false : true)};
            const optsD = {"disabled": (ship.status === "READY" || ship.status === "BROKEN" ? false : true)};
            const indicatorFactor = 10.4;
            const conditionIndicatorWidth = ship.condition / indicatorFactor;
            const peakConditionIndicatorWidth = (ship.peakCondition - ship.condition) / indicatorFactor;
            return <AccordionItem key={ship.id}>
                <AccordionHeader targetId={ship.id.toString()}>
                    <p style={{margin: 0, width: 15 + "%"}}>{ship.status}</p>
                    <p style={{margin: 0, width: 26 + "%"}}>{ship.name}</p>
                    <p style={{margin: 0, width: 8 + "%"}}>{ship.condition} / {ship.peakCondition}</p>
                    <div style={{margin: 0, width: conditionIndicatorWidth + "%", height: 12 + "px", backgroundColor: "green"}}></div>
                    <div style={{margin: 0, width: peakConditionIndicatorWidth + "%", height: 12 + "px", backgroundColor: "red"}}></div>
                </AccordionHeader>
                <AccordionBody accordionId={ship.id.toString()}>
                    <div style={{display: "inline-flex", float: "left", width: 85 + "%"}}>
                        <img src={spaceship} alt="spaceship.png" style={{maxHeight: 100 + "px"}}></img>
                        <div style={{width: 25 + "%"}}>
                            <p style={{margin: 0, textAlign: "left"}}>{ship.name}</p>
                            <p style={{margin: 0, textAlign: "left"}}>ID: {ship.id}</p>
                            <p style={{margin: 0, textAlign: "left"}}>Current Status: {ship.status}</p>
                            <p style={{margin: 0, textAlign: "left"}}>Current Condition: {ship.condition} / {ship.peakCondition}</p>
                        </div>
                        <p style={{margin: 0, width: 100 + "%", textAlign: "left"}}>{ship.description}</p>
                    </div>
                    <ButtonGroup vertical style={{float: "right"}}>
                        <Button size="sm" color="primary" tag={Link} to={"/mission-control/" + ship.id} {...optsM}>Assign Mission</Button>
                        <Button size="sm" color="success" onClick={() => this.launch(ship.id)} {...optsL}>Launch Ship</Button>
                        <Button size="sm" color="secondary" onClick={() => this.repair(ship.id)} {...optsR}>Conduct Repairs</Button>
                        <Button size="sm" color="warning" onClick={() => this.abort(ship.id)} {...optsA}>Abort Mission</Button>
                        <Button size="sm" color="danger" onClick={() => this.decommission(ship.id)} {...optsD}>Decommission Ship</Button>
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
                        <Button color="primary" tag={Link} to="/mission-control">Launch Assigned Ships</Button>
                        <Button color="danger" tag={Link} to="/mission-control">Abort All Missions</Button>
                    </div>
                    <UncontrolledAccordion flush defaultOpen="0">
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