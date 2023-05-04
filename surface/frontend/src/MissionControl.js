import { useState, useEffect, useRef } from "react";
import { Button, ButtonGroup, Container, Alert, Accordion, AccordionBody, AccordionHeader, AccordionItem, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Link, useLocation } from 'react-router-dom';
import AppNavbar from "./AppNavbar";
import spaceship from './images/spaceship.png';

function MissionControl() {

    async function refresh() {
        fetch('/ships')
            .then(response => {
                if (!response.ok) {
                    return Promise.reject(response);
                }
                setNoConnection(false);
                return response.json();
            })
            .then(data => setShips(data))
            .catch(error => {
                //console.log(error);
                setNoConnection(true);
            });
        
        //fetch('/ships')
        //    .then(response => response.json())
        //    .then(data => setShips(data));
    }

    async function launch(id) {
        await fetch("/ships/" + id + "/launch");
        refresh();
    }

    async function repair(id) {
        await fetch("/ships/" + id + "/repair");
        refresh();
    }

    async function decommission(id) {
        console.log("TODO " + id);
        await fetch("/ships/" + id + "/decommission");
        refresh();
    }

    async function abort(id) {
        console.log("TODO");
    }

    const NO_CONNECTION_JSX = (<Alert color="danger">Error: no connection to server.</Alert>);

    const searchUrl = useLocation().search;
    const openShipId = new URLSearchParams(searchUrl).get("open-ship");

    const [ships, setShips] = useState([]);
    const [accordionOpen, setAccordionOpen] = useState(openShipId);
    const [noConnection, setNoConnection] = useState(true);
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
        const optsA = {"disabled": (ship.status === "AWAITING_TAKEOFF" || ship.status === "OUTBOUND" ? false : true)};
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
                    <ConfirmationBackedButton
                        size="sm"
                        color="success"
                        buttonText="Launch Ship"
                        headerText="Confirm Ship Launch"
                        contents="The ship becomes unavailable for the duration of the mission. Aborting its mission brings it back sooner."
                        onConfirmation={() => launch(ship.id)}
                        options={optsL}/>
                    <Button size="sm" color="secondary" onClick={() => repair(ship.id)} {...optsR}>Conduct Repairs</Button>
                    <ConfirmationBackedButton
                        size="sm"
                        color="warning"
                        buttonText="Abort Mission"
                        headerText="Confirm Mission Aborting"
                        contents="If a mission is aborted, the ship starts its return trip immediately, leaving its mission incomplete."
                        onConfirmation={() => abort(ship.id)}
                        options={optsA}/>
                    <ConfirmationBackedButton
                        size="sm"
                        color="danger"
                        buttonText="Decommission Ship"
                        headerText="Confirm Ship Decommissioning"
                        contents="Once a ship is decommissioned, it cannot be used anymore."
                        onConfirmation={() => decommission(ship.id)}
                        options={optsD}/>
                </ButtonGroup>
            </AccordionBody>
        </AccordionItem>
    });
        
    return (
        <div>
            <AppNavbar/>
            <Container fluid>
                {noConnection ? NO_CONNECTION_JSX : ""}
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

function ConfirmationBackedButton({ onConfirmation, size, color, buttonText, headerText, contents, options }) {
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);
    const wrappedFunction = () => {
        toggle();
        onConfirmation();
    }
    return (
        <>
            <Button size={size} color={color} onClick={toggle} {...options}>{buttonText}</Button>
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>{headerText}</ModalHeader>
                <ModalBody>{contents}</ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={wrappedFunction}>Confirm</Button>
                    <Button color="secondary" onClick={toggle}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

export default MissionControl;
