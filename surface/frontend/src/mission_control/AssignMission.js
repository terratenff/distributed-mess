import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Container, Form, FormGroup, Input, Label, Row, Col } from 'reactstrap';
import AppNavbar from "./../AppNavbar";
import spaceship from '../images/spaceship.png';

/**
 * Creates the mission assigning page of the application.
 * @returns Mission assignment page.
 */
function AssignMission() {

    /**
     * Fetches a specific ship from the application and updates the component with it.
     * @param {*} targetShipId ID of the ship that is to be fetched.
     */
    async function fetchShip(targetShipId) {
        const fetchedShip = await (await fetch("/ships/" + targetShipId)).json();
        setShip(fetchedShip);

        if (fetchedShip.mission !== null) {
            setMission({...fetchedShip.mission});
        }
    }

    /**
     * Sends the contents of the form to the backend for processing, and redirects user back to the mission contrl page.
     * @param {*} event Click event.
     */
    async function handleSubmit(event) {
        event.preventDefault();

        const assignedShip = ship;
        assignedShip.mission = mission;

        await fetch('/ships/' + assignedShip.id, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assignedShip),
        });

        navigate("/mission-control?open-ship=" + assignedShip.id);
    }

    /**
     * Updates maintained mission entity.
     * @param {*} event Change event that came from editing a form.
     */
    async function handleChange(event) {
        const target = event.target;
        const varValue = target.value;
        const varName = target.name;
        let item = mission;
        item[varName] = varValue;
        setMission(mission);
    }

    const navigate = useNavigate();
    const [ship, setShip] = useState ({
        name: '',
        status: 'READY',
        condition: 100,
        peakCondition: 100,
        description: "",
        mission: null,
        logs: []
    });
    const [mission, setMission] = useState({
        title: "",
        objective: "Exploration",
        description: null,
        centerX: 0.0,
        centerY: 0.0,
        centerZ: 0.0,
        radius: 0.0,
        departureTime: null,
        arrivalTime: null,
        currentDestination: "None",
        events: []
    });

    const shipId = useParams();

    useEffect(() => {
        fetchShip(shipId.id);
    }, [shipId.id]);

    return (
        <div>
            <AppNavbar/>
            <Container>
                <h3>Assign Mission</h3>
                <div style={{display: "inline-flex", textAlign: "left", width: 100 + "%"}}>
                    <img src={spaceship} alt="spaceship.png" style={{maxHeight: 100 + "px"}}></img>
                    <div style={{float: "left", width: 30 + "%"}}>
                        <p style={{margin: 0, textAlign: "left"}}>{ship.name}</p>
                        <p style={{margin: 0, textAlign: "left"}}>ID: {ship.id}</p>
                        <p style={{margin: 0, textAlign: "left"}}>Current Status: {ship.status}</p>
                        <p style={{margin: 0, textAlign: "left"}}>Current Condition: {ship.condition} / {ship.peakCondition}</p>
                    </div>
                    <p style={{margin: 0, width: 100 + "%", textAlign: "left"}}>{ship.description}</p>
                </div>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label for="title">Mission Title</Label>
                        <Input type="text" name="title" id="title" defaultValue={mission.title}
                            placeholder="Insert Mission Title Here" onChange={handleChange} key={mission.title} required/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="objective">Mission Objective</Label>
                        <Input type="select" name="objective" id="objective" defaultValue={mission.objective}
                               onChange={handleChange} key={mission.objective} required>
                            <option>Exploration</option>
                            <option>Transportation</option>
                            <option>Search</option>
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label>Target Coordinates</Label>
                        <Row>
                            <Col>
                                <Input type="number" name="centerX" id="centerX" defaultValue={mission.centerX}
                                    placeholder="X-Coordinate" onChange={handleChange} key={mission.centerX} required/>
                            </Col>
                            <Col>
                                <Input type="number" name="centerY" id="centerY" defaultValue={mission.centerY}
                                    placeholder="Y-Coordinate" onChange={handleChange} key={mission.centerY} required/>
                            </Col>
                            <Col>
                                <Input type="number" name="centerZ" id="centerZ" defaultValue={mission.centerZ}
                                    placeholder="Z-Coordinate" onChange={handleChange} key={mission.centerZ} required/>
                            </Col>
                        </Row>
                    </FormGroup>
                    <FormGroup>
                        <Label for="radius">Mission Area Radius</Label>
                        <Input type="number" name="radius" id="radius" defaultValue={mission.radius}
                            placeholder="Radius" onChange={handleChange} key={mission.radius} required/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="description">Mission Description</Label><br/>
                        <Input type="textarea" name="description" id="description" defaultValue={mission.description}
                        placeholder="Write notes for why this mission is necessary."
                        onChange={handleChange}/>
                    </FormGroup>
                    <FormGroup>
                        <Button color="primary" type="submit">Save</Button>{' '}
                        <Button color="secondary" tag={Link} to={"/mission-control?open-ship=" + ship.id}>Cancel</Button>
                    </FormGroup>
                </Form>
            </Container>
        </div>
    );
}

export default AssignMission;