import { useState, useEffect, useRef } from "react";
import {
    Button,
    ButtonGroup,
    Container,
    Alert,
    Accordion,
    AccordionBody,
    AccordionHeader,
    AccordionItem,
    UncontrolledCollapse,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Label,
    InputGroup,
    InputGroupText
} from 'reactstrap';
import { Link } from 'react-router-dom';
import AppNavbar from "./AppNavbar";
import spaceship from './images/spaceship.png';
import AppFooter from "./AppFooter";

/**
 * Creates the mission control page of the application.
 * @returns Mission control page.
 */
function MissionControl() {

    /**
     * Updates the component with ship entities that are fetched from the application.
     */
    async function refresh() {
        const shipCount = await (await fetch(`/ships/count`)).json();
        dynamicFilter.current = shipCount <= shipLoadLimit.current;
        let url = `/ships/recent?limit=${shipLoadLimit.current}`;
        if (dynamicFilter.current) {
            previousConfirmedQuery.current = filterValue;
            if (filterValue.length !== 0) {
                url = url + `&query=${filterValue}`;
            }
        } else {
            if (previousConfirmedQuery.current.length !== 0) {
                url = url + `&query=${previousConfirmedQuery.current}`;
            }
        }
        await fetch(url)
        .then(response => {
            if (!response.ok) {
                return Promise.reject(response);
            }
            setNoConnection(false);
            return response.json();
        })
        .then(data => setShips(data))
        .catch(error => {
            setNoConnection(true);
        });
    }

    /**
     * Launches specified ship to space.
     * @param {*} ship Ship that is to be launched to space. The ship in question must be assigned to a mission.
     */
    async function launch(ship) {
        await fetch("/ships/launch", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ship),
        });
        refresh();
    }

    /**
     * Launches all ships that have a mission to space.
     */
    async function launchAll() {
        await fetch("/ships/launch-all", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: "{}",
        });
        refresh();
    }

    /**
     * Sends specified ship to repairs.
     * @param {*} ship Ship that is to be repaired. The ship in question must be damaged.
     */
    async function repair(ship) {
        await fetch("/ships/repair", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ship),
        });
        refresh();
    }

    /**
     * Decommissions specified ship, making it unusable.
     * @param {*} ship Ship that is to be decommissioned. The ship in question must be available.
     */
    async function decommission(ship) {
        await fetch("/ships/decommission", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ship),
        });
        refresh();
    }

    /**
     * Instructs specified ship to abort its mission and return.
     * @param {*} id ID of the ship that is to abandon its mission. The ship in question must be executing its mission.
     */
    async function abort(ship) {
        await fetch("/ships/abort", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ship),
        });
        refresh();
    }

    /**
     * Instructs every ship that is executing its mission to abort their activities and return.
     */
    async function abortAll() {
        await fetch("/ships/abort-all", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: "{}",
        });
        refresh();
    }

    async function changeShipLoadLimit(newShipLoadLimit) {
        shipLoadLimit.current = newShipLoadLimit;
        refresh();
    }

    async function handleFilterChange(event) {
        setFilterValue(event.target.value);
    }

    async function handleKeyDown(event) {
        if (event.code === "Enter" && previousConfirmedQuery.current !== filterValue) {
            previousConfirmedQuery.current = filterValue;
            refresh();
        }
    }

    async function handleBlur(event) {
        if (previousConfirmedQuery.current !== filterValue) {
            previousConfirmedQuery.current = filterValue;
            refresh();
        }
    }

    const NO_CONNECTION_JSX = (<Alert color="danger">Error: no connection to server.</Alert>);

    const [ships, setShips] = useState([]);
    const [accordionOpen, setAccordionOpen] = useState("0");
    const shipLoadLimit = useRef(25);
    const dynamicFilter = useRef(true);
    const previousConfirmedQuery = useRef("");
    const [filterValue, setFilterValue] = useState("");
    const [noConnection, setNoConnection] = useState(true);
    const initialized = useRef(false);

    /**
     * Operates the accordion component.
     * @param {*} id ID of the accordion to open.
     */
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

    let filterFieldAlert = (
        <Alert color="warning" style={{margin: "0px"}}>
            {shipLoadLimit.current}+ ship entities found. Only the first {shipLoadLimit.current} ships are shown.
            Use ship filtering below to find relevant ships. Hit enter to start filter query.
        </Alert>
    );

    let filterField = (
        <InputGroup>
            <InputGroupText style={{width: "200px"}} color="primary">
                <Label for="filter" style={{margin: "0px"}}>Filter ships</Label>
            </InputGroupText>
            <Input
                type="text"
                name="filter"
                id="filter"
                placeholder="(Search by ship name)"
                value={filterValue}
                onChange={handleFilterChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
            />
        </InputGroup>
    );

    // Building the accordion component.
    let filteredShips = ships;
    if (dynamicFilter.current) {
        filteredShips = filteredShips.filter(ship => ship.name.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase()));
    }
    const shipList = filteredShips.map(ship => {
        const optsM = {"disabled": (ship.status === "READY" ? false : true)};
        const optsL = {"disabled": (ship.status === "READY" && ship.mission !== null ? false : true)};
        const optsR = {"disabled": ((ship.status === "READY" || ship.status === "BROKEN") && ship.condition < ship.peakCondition ? false : true)};
        const optsA = {"disabled": (ship.status.startsWith("AWAITING_TAKEOFF") || ship.status === "OUTBOUND" || ship.status === "TAKING_OFF" ? false : true)};
        const optsD = {"disabled": (ship.status === "READY" || ship.status === "BROKEN" ? false : true)};
        const indicatorFactor = 10.4;
        const conditionIndicatorWidth = ship.condition / indicatorFactor;
        const peakConditionIndicatorWidth = (ship.peakCondition - ship.condition) / indicatorFactor;

        let missionDetailsIndicator;
        let missionDetails;
        if (ship.mission !== null) {
            // Ship has a mission, so create a button that shows mission details.
            missionDetailsIndicator = (
                <Button id={"collapse" + ship.id} style={{float: "left"}}>Mission Details</Button>
            );
            missionDetails = (
                <UncontrolledCollapse toggler={"#collapse" + ship.id} style={{float: "left", paddingLeft: 100 + "px"}}>
                    <p style={{marginBottom: 0, textAlign: "left"}}>Mission Title: {ship.mission.title}</p>
                    <p style={{marginBottom: 0, textAlign: "left"}}>Mission Objective: {ship.mission.objective}</p>
                    <p style={{marginBottom: 0, textAlign: "left"}}>Mission Coordinates (X / Y / Z): {ship.mission.centerX} / {ship.mission.centerY} / {ship.mission.centerZ}</p>
                    <p style={{marginBottom: 0, textAlign: "left"}}>Mission Area Radius: {ship.mission.radius}</p>
                    <p style={{marginBottom: 0, textAlign: "left"}}>Mission Description:</p>
                    <br/>
                    <p style={{marginBottom: 0, textAlign: "left"}}>{ship.mission.description}</p>
                </UncontrolledCollapse>
            );
        } else {
            missionDetailsIndicator = (<p style={{float: "left"}} className="text-muted">Unassigned</p>);
            missionDetails = (<></>);
        }

        return <AccordionItem key={ship.id}>
            <AccordionHeader targetId={ship.id.toString()}>
                <p style={{margin: 0, width: 15 + "%"}}>{ship.status}</p>
                <p style={{margin: 0, width: 26 + "%"}}>{ship.name}</p>
                <p style={{margin: 0, width: 8 + "%"}}>{ship.condition} / {ship.peakCondition}</p>
                <div style={{margin: 0, width: conditionIndicatorWidth + "%", height: 12 + "px", backgroundColor: "green"}}></div>
                <div style={{margin: 0, width: peakConditionIndicatorWidth + "%", height: 12 + "px", backgroundColor: "red"}}></div>
            </AccordionHeader>
            <AccordionBody accordionId={ship.id.toString()}>
                <div style={{height: "160px"}}>
                    <div style={{display: "inline-flex", float: "left", width: 85 + "%"}}>
                        <img src={spaceship} alt="spaceship.png" style={{maxHeight: 100 + "px"}}></img>
                        <div style={{width: 35 + "%"}}>
                            <p style={{margin: 0, textAlign: "left"}}>{ship.name}</p>
                            <p style={{margin: 0, textAlign: "left"}}>ID: {ship.id}</p>
                            <p style={{margin: 0, textAlign: "left"}}>Current Status: {ship.status}</p>
                            <p style={{margin: 0, textAlign: "left"}}>Current Condition: {ship.condition} / {ship.peakCondition}</p>
                            {missionDetailsIndicator}
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
                            onConfirmation={() => launch(ship)}
                            options={optsL}/>
                        <Button size="sm" color="secondary" onClick={() => repair(ship)} {...optsR}>Conduct Repairs</Button>
                        <ConfirmationBackedButton
                            size="sm"
                            color="warning"
                            buttonText="Abort Mission"
                            headerText="Confirm Mission Aborting"
                            contents="If a mission is aborted, the ship starts its return trip immediately, leaving its mission incomplete."
                            onConfirmation={() => abort(ship)}
                            options={optsA}/>
                        <ConfirmationBackedButton
                            size="sm"
                            color="danger"
                            buttonText="Decommission Ship"
                            headerText="Confirm Ship Decommissioning"
                            contents="Once a ship is decommissioned, it cannot be used anymore."
                            onConfirmation={() => decommission(ship)}
                            options={optsD}/>
                    </ButtonGroup>
                </div>
                {missionDetails}
            </AccordionBody>
        </AccordionItem>
    });
        
    return (
        <div>
            <AppNavbar/>
            <Container fluid className="page-fill">
                {noConnection ? NO_CONNECTION_JSX : ""}
                <h3>Mission Control</h3>
                <InputGroup>
                    <ButtonGroup>
                        <InputGroupText style={{width: "200px"}}>General controls</InputGroupText>
                        <ConfirmationBackedButton
                                size="lg"
                                color="primary"
                                buttonText="Launch Assigned Ships"
                                headerText="Confirm Ship Launches"
                                contents="Every assigned ship will be sent. Unassigned ships will remain."
                                onConfirmation={() => launchAll()}
                                options={{}}/>
                        <ConfirmationBackedButton
                                size="lg"
                                color="secondary"
                                buttonText="Send Unassigned Ships to Repairs"
                                headerText="Confirm Mission Terminations"
                                contents="Every unassigned ship will be sent for repairs."
                                onConfirmation={() => console.log("TODO")}
                                options={{}}/>
                        <ConfirmationBackedButton
                                size="lg"
                                color="warning"
                                buttonText="Unassign Assigned Ships"
                                headerText="Confirm Mission Terminations"
                                contents="Every assigned ship will be unassigned, resulting in loss of mission data."
                                onConfirmation={() => console.log("TODO")}
                                options={{}}/>
                        <ConfirmationBackedButton
                                size="lg"
                                color="danger"
                                buttonText="Abort All Missions"
                                headerText="Confirm Mission Terminations"
                                contents="Every ship that is executing its mission is commanded to come back, leaving their missions incomplete."
                                onConfirmation={() => abortAll()}
                                options={{}}/>
                    </ButtonGroup>
                </InputGroup>
                <InputGroup>
                    <ButtonGroup>
                        <InputGroupText style={{width: "200px"}}>Ship load quantity</InputGroupText>
                        <Button
                            color={shipLoadLimit.current === 25 ? "primary" : "secondary"}
                            disabled={shipLoadLimit.current === 25}
                            onClick={() => changeShipLoadLimit(25)}
                            size="lg"
                        >
                            25
                        </Button>
                        <Button
                            color={shipLoadLimit.current === 100 ? "primary" : "secondary"}
                            disabled={shipLoadLimit.current === 100}
                            onClick={() => changeShipLoadLimit(100)}
                            size="lg"
                        >
                            100
                        </Button>
                        <Button
                            color={shipLoadLimit.current === 250 ? "primary" : "secondary"}
                            disabled={shipLoadLimit.current === 250}
                            onClick={() => changeShipLoadLimit(250)}
                            size="lg"
                        >
                            250
                        </Button>
                        <Button
                            color={shipLoadLimit.current === 500 ? "primary" : "secondary"}
                            disabled={shipLoadLimit.current === 500}
                            onClick={() => changeShipLoadLimit(500)}
                            size="lg"
                        >
                            500
                        </Button>
                        <Button
                            color={shipLoadLimit.current === 1000 ? "primary" : "secondary"}
                            disabled={shipLoadLimit.current === 1000}
                            onClick={() => changeShipLoadLimit(1000)}
                            size="lg"
                        >
                            1000
                        </Button>
                        <Button
                            color={shipLoadLimit.current === 999999999 ? "primary" : "secondary"}
                            disabled={shipLoadLimit.current === 999999999}
                            onClick={() => changeShipLoadLimit(999999999)}
                            size="lg"
                        >
                            All
                        </Button>
                    </ButtonGroup>
                </InputGroup>
                {dynamicFilter.current ? "" : filterFieldAlert}
                {filterField}
                <Accordion flush open={accordionOpen} toggle={(id) => operateAccordion(id)}>
                    {shipList}
                </Accordion>
            </Container>
            <AppFooter/>
        </div>
    );
}

/**
 * Convenience component for a button that, after pressing, summons a confirmation screen.
 * @param {*} properties Collection of properties. "onConfirmation" is the intended function.
 * @returns Confirmation-backed button component.
 */
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
