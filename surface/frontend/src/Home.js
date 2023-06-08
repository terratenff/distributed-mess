import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Table, Card, CardBody, CardTitle, CardSubtitle, CardText } from 'reactstrap';
import { motion } from 'framer-motion';
import './App.css';
import AppNavbar from './AppNavbar';
import AppFooter from './AppFooter';
import spaceship from "./images/spaceship.png";
import HomeCarousel from "./components/HomeCarousel";

function Home() {

    async function fetchShips() {
        const fetchedShips = await (await fetch("/ships")).json();
        setShips(fetchedShips);
    }

    async function fetchMissions() {
        const fetchedMissions = await (await fetch("/missions")).json();
        setMissions(fetchedMissions);
    }

    async function refresh() {
        fetchShips();
        fetchMissions();
    }

    async function showMoreShipLogs() {
        setMaxLogs(maxLogs + loadIncrement);
    }

    async function showMoreMissionEvents() {
        setMaxEvents(maxEvents + loadIncrement);
    }

    const loadIncrement = 12;

    const [ships, setShips] = useState([]);
    const [missions, setMissions] = useState([]);

    const [maxLogs, setMaxLogs] = useState(loadIncrement);
    const [maxEvents, setMaxEvents] = useState(loadIncrement);
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchShips();
            fetchMissions();
        }
    });

    let availableShipsBase = (<p>There are no ships available. Create more or wait for existing ones to become available.</p>);
    let availableShipsCount = 0;
    const availableShips = ships.map((ship) => {
        if (ship.status === "READY") {
            availableShipsCount++;
            const conditionWidth = (ship.condition / ship.peakCondition) * 100;
            const peakConditionWidth = ((ship.peakCondition - ship.condition) / ship.peakCondition) * 100;
            return (
                <motion.tr key={ship.id} initial={{opacity: 0}} whileInView={{opacity: 1, transition: {duration: 2}}}>
                    <td>
                        <img src={spaceship} alt="spaceship.png" style={{maxHeight: 100 + "px"}}></img>
                    </td>
                    <td>{ship.name}</td>
                    <td>{ship.description}</td>
                    <td>{ship.status}</td>
                    <td>
                        <div style={{display: "inline-block", margin: 0, width: conditionWidth + "%", height: 12 + "px", backgroundColor: "green"}}></div>
                        <div style={{display: "inline-block", margin: 0, width: peakConditionWidth + "%", height: 12 + "px", backgroundColor: "red"}}></div>
                    </td>
                </motion.tr>
            );
        } else {
            return (<></>);
        }
    });
    if (availableShipsCount > 0) {
        availableShipsBase = (
            <Table borderless hover style={{textAlign: "left", verticalAlign: "middle"}}>
                <thead>
                <tr>
                    <th width="5%"></th>
                    <th width="20%">Name</th>
                    <th width="25%">Description</th>
                    <th width="15%">Status</th>
                    <th width="35%">Condition</th>
                </tr>
                </thead>
                <tbody>
                {availableShips}
                </tbody>
            </Table>
        );
    }
    
    let busyShipsBase = (<p>All of the ships are idle. Send some to missions to space or repair them.</p>);
    let busyShipsCount = 0;
    const busyShips = ships.map((ship) => {
        if (ship.status !== "READY") {
            busyShipsCount++;
            const conditionWidth = (ship.condition / ship.peakCondition) * 100;
            const peakConditionWidth = ((ship.peakCondition - ship.condition) / ship.peakCondition) * 100;
            return (
                <motion.tr key={ship.id} initial={{opacity: 0}} whileInView={{opacity: 1, transition: {duration: 2}}}>
                    <td style={{whiteSpace: 'nowrap'}}>
                        <img src={spaceship} alt="spaceship.png" style={{maxHeight: 100 + "px"}}></img>
                    </td>
                    <td>{ship.name}</td>
                    <td>{ship.description}</td>
                    <td>{ship.status}</td>
                    <td>
                        <div style={{display: "inline-block", margin: 0, width: conditionWidth + "%", height: 12 + "px", backgroundColor: "green"}}></div>
                        <div style={{display: "inline-block", margin: 0, width: peakConditionWidth + "%", height: 12 + "px", backgroundColor: "red"}}></div>
                    </td>
                </motion.tr>
            );
        } else {
            return (<></>);
        }
    });
    if (busyShipsCount > 0) {
        busyShipsBase = (
            <Table borderless hover style={{textAlign: "left", verticalAlign: "middle"}}>
                <thead>
                <tr>
                    <th width="5%"></th>
                    <th width="20%">Name</th>
                    <th width="25%">Description</th>
                    <th width="15%">Status</th>
                    <th width="35%">Condition</th>
                </tr>
                </thead>
                <tbody>
                {busyShips}
                </tbody>
            </Table>
        );
    }

    let shipLogsData = {};
    let shipLogsTimestamps = [];
    let shipData = {};
    let shipIndices = [];
    let allLogsLoaded = true;
    let i = 0;
    for (let j = 0; j < ships.length; j++) {
        const ship = ships[j];
        for (let k = 0; k < ship.logs.length; k++) {
            const log = ship.logs[k];
            shipData[i] = ship;
            shipLogsData[i] = log;
            shipLogsTimestamps.push(log.timestamp);
            shipIndices.push(i);
            i++;
        }
    }

    allLogsLoaded = i <= maxLogs;
    shipIndices.sort(function(a, b) {
        return Date.parse(shipLogsTimestamps[b]) - Date.parse(shipLogsTimestamps[a]);
    });
    shipIndices.splice(maxLogs);
    
    let shipLogsCore = (
        <Container style={{textAlign: "center"}}>
            <p>No ship events have occurred so far.</p>
            <Button onClick={() => fetchShips()}>Refresh</Button>
        </Container>
    );
    if (shipIndices.length > 0) {
        shipLogsCore = shipIndices.map((index) => {
            const currentLog = shipLogsData[index];
            const currentShip = shipData[index];
            const randomId = Math.floor(Math.random() * 100);
            return (
                <motion.div style={{display: "inline-block"}} key={currentLog.id}
                initial={{opacity: 0, y: 400}}
                whileInView={{opacity: 1, y: 0, transition: {duration: 0.5}}}>
                    <Card
                        style={{width: "300px", height: "400px", margin: "10px", display: "inline-block", verticalAlign: "top"}}>
                        <img alt="(Ship Log Illustration)" src={"https://picsum.photos/id/" + randomId + "/300/200"}/>
                        <CardBody>
                            <CardTitle>{currentShip.name} - Ship Log</CardTitle>
                            <CardSubtitle className="text-muted">{currentLog.timestamp}</CardSubtitle>
                            <CardText>{currentLog.description}</CardText>
                        </CardBody>
                    </Card>
                </motion.div>
            );
        });
    }

    let shipLogsButton = (
        <motion.div initial={{opacity: 0}} whileInView={{opacity: 1, y: 0, transition: {duration: 1.0}}}>
            <Container style={{textAlign: "center", marginTop: "10px", marginBottom: "10px"}}>
                <Button onClick={() => showMoreShipLogs()}>Show More Ship Events</Button>
            </Container>
        </motion.div>
    );

    let shipLogs = (
        <>
            {shipLogsCore}
            {shipIndices.length > 0 && !allLogsLoaded ? shipLogsButton : ""}
        </>
    );

    let missionEventsData = {};
    let missionEventsTimestamps = [];
    let missionData = {};
    let missionIndices = [];
    let allEventsLoaded = true;
    i = 0;
    for (let j = 0; j < missions.length; j++) {
        const mission = missions[j];
        for (let k = 0; k < mission.events.length; k++) {
            const event = mission.events[k];
            missionData[i] = mission;
            missionEventsData[i] = event;
            missionEventsTimestamps.push(event.timestamp);
            missionIndices.push(i);
            i++;
        }
    }

    allEventsLoaded = i <= maxEvents;
    missionIndices.sort(function(a, b) {
        return Date.parse(missionEventsTimestamps[b]) - Date.parse(missionEventsTimestamps[a]);
    });
    missionIndices.splice(maxEvents);

    let missionEventsCore = (
        <Container style={{textAlign: "center"}}>
            <p>No mission events have occurred so far.</p>
            <Button onClick={() => fetchMissions()}>Refresh</Button>
        </Container>
    );
    if (missionIndices.length > 0) {
        missionEventsCore = missionIndices.map((index) => {
            const currentEvent = missionEventsData[index];
            const currentMission = missionData[index];
            const randomId = Math.floor(Math.random() * 100);
            return (
                <motion.div style={{display: "inline-block"}} key={currentEvent.id}
                initial={{opacity: 0, y: 400}}
                whileInView={{opacity: 1, y: 0, transition: {duration: 0.5}}}>
                    <Card
                        style={{width: "300px", height: "400px", margin: "10px", display: "inline-block", verticalAlign: "top"}}>
                        <img alt="(Mission Event Illustration)" src={"https://picsum.photos/id/" + randomId + "/300/200"}/>
                        <CardBody>
                            <CardTitle>{currentMission.title} - Ship Event</CardTitle>
                            <CardSubtitle className="text-muted">{currentEvent.timestamp}</CardSubtitle>
                            <CardText>{currentEvent.description}</CardText>
                        </CardBody>
                    </Card>
                </motion.div>
            );
        });
    }

    let missionEventsButton = (
        <motion.div initial={{opacity: 0}} whileInView={{opacity: 1, y: 0, transition: {duration: 1.0}}}>
            <Container style={{textAlign: "center", marginTop: "10px", marginBottom: "10px"}}>
                <Button onClick={() => showMoreMissionEvents()}>Show More Mission Events</Button>
            </Container>
        </motion.div>
    );

    let missionEvents = (
        <>
            {missionEventsCore}
            {missionIndices.length > 0 && !allEventsLoaded ? missionEventsButton : ""}
        </>
    );

    return (
        <div>
            <AppNavbar/>
            <h1>Surface</h1>
            <p>Send ships to "space" to do things.</p>

            <HomeCarousel/>

            <Container style={{marginTop: "10px", marginBottom: "10px"}}>
                <Button onClick={() => refresh()}>Refresh</Button>
            </Container>

            <h2>Available Ships</h2>
            {availableShipsBase}
            <h2>Active Ships</h2>
            {busyShipsBase}
            <h2>Ship Events</h2>
            <Container style={{textAlign: "left"}}>
                {shipLogs}
            </Container>
            <h2>Mission Events</h2>
            <Container style={{textAlign: "left"}}>
                {missionEvents}
            </Container>

            <AppFooter/>
        </div>
    );
}

export default Home;