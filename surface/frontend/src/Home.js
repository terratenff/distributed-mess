import React, { useState, useEffect, useRef } from 'react';
import { Container, Table, Card, CardBody, CardTitle, CardSubtitle, CardText,
         Carousel, CarouselItem, CarouselControl, CarouselIndicators, CarouselCaption } from 'reactstrap';
import { motion } from 'framer-motion';
import './App.css';
import AppNavbar from './AppNavbar';
import spaceship from "./images/spaceship.png";

function Home() {

    async function fetchShips() {
        const fetchedShips = await (await fetch("/ships")).json();
        setShips(fetchedShips);
    }

    const frontItems = [
        {
            src: "https://picsum.photos/id/1/1200/800",
            altText: "Space",
            captionHeader: "Space module is out of order.",
            caption: "Space is currently inaccessible. Stay tuned for updates on that front!",
            key: 1
        },
        {
            src: "https://picsum.photos/id/2/1200/800",
            altText: "Mission Control",
            captionHeader: "Send ships to space from Mission Control.",
            caption: "Mission Control lets you assign missions for ships, launch them to space, conduct repairs and, if necessary, abort missions.",
            key: 2
        },
        {
            src: "https://picsum.photos/id/3/1200/800",
            altText: "Shipyard",
            captionHeader: "Create new ships in the Shipyard.",
            caption: "Ships can be created, edited and deleted in the Shipyard.",
            key: 3
        },
        {
            src: "https://picsum.photos/id/4/1200/800",
            altText: "Drydock",
            captionHeader: "Ships are repaired in the Drydock.",
            caption: "Note that Drydock has limited capacity: only one ship can be repaired at a time.",
            key: 4
        },
        {
            src: "https://picsum.photos/id/5/1200/800",
            altText: "Launch Site",
            captionHeader: "Ships are sent to space from the Launch Site.",
            caption: "Once a ship has been instructed to launch to space from Mission Control, it is relocated here. There's only room for one, though.",
            key: 5
        }
    ];

    const [frontIndex, setFrontIndex] = useState(0);
    const [frontAnimating, setFrontAnimating] = useState(false);
    const [ships, setShips] = useState([]);

    const frontNext = () => {
        if (frontAnimating) return;
        const nextIndex = frontIndex === frontItems.length - 1 ? 0 : frontIndex + 1;
        setFrontIndex(nextIndex);
    };
    
    const frontPrevious = () => {
        if (frontAnimating) return;
        const nextIndex = frontIndex === 0 ? frontItems.length - 1 : frontIndex - 1;
        setFrontIndex(nextIndex);
    };

    const frontGoToIndex = (newIndex) => {
        if (frontAnimating) return;
        setFrontIndex(newIndex);
    };

    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchShips();
        }
    });

    const frontSlides = frontItems.map((item) => {
        return (
            <CarouselItem onExiting={() => setFrontAnimating(true)} on onExited={() => setFrontAnimating(false)} key={item.src}>
                <img src={item.src} alt={item.altText}/>
                <CarouselCaption captionText={item.caption} captionHeader={item.captionHeader}/>
            </CarouselItem>
        );
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
    shipLogsData = shipLogsData.flat();

    const shipLogs = shipLogsData.map((currentLog) => {
        return (
            <motion.div style={{display: "inline-block"}} key={currentLog.id}
            initial={{opacity: 0, y: 400}}
            whileInView={{opacity: 1, y: 0, transition: {duration: 1}}}>
            <Card
                style={{width: "300px", height: "400px", margin: "10px", display: "inline-block", verticalAlign: "top"}}>
                <img alt="Ship Log" src="https://picsum.photos/300/200"/>
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

            <Carousel activeIndex={frontIndex} next={frontNext} previous={frontPrevious} style={{ backgroundColor: "gray"}}>
                <CarouselIndicators items={frontItems} activeIndex={frontIndex} onClickHandler={frontGoToIndex}/>
                {frontSlides}
                <CarouselControl direction="prev" directionText="Previous" onClickHandler={frontPrevious}/>
                <CarouselControl direction="next" directionText="Next" onClickHandler={frontNext}/>
            </Carousel>

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