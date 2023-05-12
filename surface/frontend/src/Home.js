import React, { useState, useEffect, useRef } from 'react';
import { Container, Table, Card, CardBody, CardTitle, CardSubtitle, CardText } from 'reactstrap';
import { motion } from 'framer-motion';
import './App.css';
import AppNavbar from './AppNavbar';
import spaceship from "./images/spaceship.png";
import HomeCarousel from "./components/HomeCarousel";

function Home() {

    async function fetchShips() {
        const fetchedShips = await (await fetch("/ships")).json();
        setShips(fetchedShips);
    }

    const [ships, setShips] = useState([]);

    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchShips();
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

    let shipLogsData = ships.map((ship) => {
        return ship.logs;
    });
    shipLogsData = shipLogsData.flat().reverse();

    const shipLogs = shipLogsData.map((currentLog) => {
        const randomId = Math.floor(Math.random() * 100);
        return (
            <motion.div style={{display: "inline-block"}} key={currentLog.id}
            initial={{opacity: 0, y: 400}}
            whileInView={{opacity: 1, y: 0, transition: {duration: 0.5}}}>
            <Card
                style={{width: "300px", height: "400px", margin: "10px", display: "inline-block", verticalAlign: "top"}}>
                <img alt="Ship Log" src={"https://picsum.photos/id/" + randomId + "/300/200"}/>
                <CardBody>
                    <CardTitle>Ship Name</CardTitle>
                    <CardSubtitle className="text-muted">{currentLog.timestamp}</CardSubtitle>
                    <CardText>{currentLog.description}</CardText>
                </CardBody>
            </Card>
            </motion.div>
        );
    });

    return (
        <div>
            <AppNavbar/>
            <h1>Surface</h1>
            <p>Send ships to "space" to do things.</p>

            <HomeCarousel/>

            <h2>Available Ships</h2>
            {availableShipsBase}
            <h2>Active Ships</h2>
            {busyShipsBase}
            <h2>Ship Events</h2>

            <Container style={{textAlign: "left"}}>
                {shipLogs}
            </Container>
        </div>
    );
}

export default Home;