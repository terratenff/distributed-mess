import { useState, useEffect, useRef } from "react";
import { Button, ButtonGroup, Container, Accordion, AccordionBody, AccordionHeader, AccordionItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import AppNavbar from "./AppNavbar";
import spaceship from './images/spaceship.png';

function MissionControl() {

    async function refresh() {
        fetch('/ships')
            .then(response => response.json())
            .then(data => setShips(data));
    }

    async function launch(id) {
        console.log("TODO");
    }

    async function repair(id) {
        fetch("/ships/" + id + "/repair");
        fetch('/ships')
            .then(response => response.json())
            .then(data => setShips(data));
    }

    async function decommission(id) {
        console.log("TODO");
    }

    async function abort(id) {
        console.log("TODO");
    }

    const [ships, setShips] = useState ([]);
    const [accordionOpen, setAccordionOpen] = useState("0");
    const initialized = useRef(false);

    function operateAccordion(id) {
        if (accordionOpen === id) {
            setAccordionOpen();
        } else {
            setAccordionOpen(id);
        }
    }

    useEffect(() => {
        const timer = setInterval(() => {
            refresh();
        }, 5000)

        if (!initialized.current) {
            refresh();
            initialized.current = true;
        }

        return () => clearInterval(timer);
    });

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
                    <Button size="sm" color="success" onClick={() => launch(ship.id)} {...optsL}>Launch Ship</Button>
                    <Button size="sm" color="secondary" onClick={() => repair(ship.id)} {...optsR}>Conduct Repairs</Button>
                    <Button size="sm" color="warning" onClick={() => abort(ship.id)} {...optsA}>Abort Mission</Button>
                    <Button size="sm" color="danger" onClick={() => decommission(ship.id)} {...optsD}>Decommission Ship</Button>
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
                <Accordion flush open={accordionOpen} toggle={(id) => operateAccordion(id)}>
                    {shipList}
                </Accordion>
            </Container>
        </div>
    );
}

export default MissionControl;
