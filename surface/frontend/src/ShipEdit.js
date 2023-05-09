import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Form, FormGroup, Input, Label, Table } from 'reactstrap';
import AppNavbar from './AppNavbar';

function ShipEdit() {

    async function fetchShip(targetShipId) {
        if (targetShipId !== 'new') {
            const fetchedShip = await (await fetch("/ships/" + targetShipId)).json();
            setShip(fetchedShip);
        } else {
            let newShip = {...ship};
            newShip["status"] = "READY";
            setShip(newShip);
        }
    }

    function handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        let item = {...ship};
        item[name] = value;
        setShip(item);
    }

    function handleLogChange(event) {
        const target = event.target;
        const value = target.value;
        let keyValue = {"description": value};
        setLogEntry(keyValue);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (ship.condition > ship.peakCondition || ship.peakCondition > 500) {
            alert("Peak condition is 500. Current condition must be lower than peak condition.");
            return;
        }

        if (ship.name.length > 50) {
            alert("Ship name length must be 50 characters or lower.");
            return;
        }
    
        await fetch('/ships' + (ship.id ? '/' + ship.id : ''), {
            method: (ship.id) ? 'PUT' : 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ship),
        });

        if (ship.id && logEntry["description"].length > 0) {
            await fetch('/ships/' + ship.id + "/logs", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry),
            });
        }

        navigate('/shipyard');
    }

    const navigate = useNavigate();
    const [ship, setShip] = useState({
        name: "",
        status: "READY",
        condition: 100,
        peakCondition: 100,
        description: "",
        mission: null,
        logs: []
    });
    const [logEntry, setLogEntry] = useState({"description": ""});

    const shipId = useParams();

    useEffect(() => {
        fetchShip(shipId.id)
    }, [shipId.id]);

    const title = <h2>{ship.id ? 'Edit Ship' : 'Add Ship'}</h2>;
    const logField = ship.id ? (
        <FormGroup>
            <Label for="logs">Log Entry</Label><br/>
            <Input type="textarea" name="logs" id="logs" value={logEntry["description"]}
            placeholder="Write a log entry for the ship."
            onChange={handleLogChange}/>
        </FormGroup>
    ) : "";
    const logTableContents = ship.logs.slice(0).reverse().map(log => {
        return (
            <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td>{log.description}</td>
            </tr>
        );
    });
    const previousLogs = ship.id ? (
        <>
            <p>Ship Logs</p>
            <Table className="left-aligned" borderless hover>
                <thead>
                    <tr>
                        <th width="20%">Timestamp</th>
                        <th width="80%">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {logTableContents}
                </tbody>
            </Table>
        </>
    ) : "";

    return (
        <div>
            <AppNavbar/>
            <Container>
                {title}
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label for="name">Name</Label>
                        <Input type="text" name="name" id="name" value={ship.name || ''}
                               onChange={handleChange} required/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="status">Status</Label><br/>
                        <Input type="text" name="status" id="status" value={ship.status}
                        onChange={handleChange} disabled required/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="condition">Condition</Label>
                        <Input type="text" name="condition" id="condition" value={ship.condition}
                               onChange={handleChange} required/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="peakCondition">Peak Condition</Label>
                        <Input type="text" name="peakCondition" id="peakCondition" value={ship.peakCondition}
                               onChange={handleChange} required/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="description">Description</Label><br/>
                        <Input type="textarea" name="description" id="description" value={ship.description}
                        placeholder="Write a description of what makes this ship noteworthy."
                        onChange={handleChange}/>
                    </FormGroup>
                    {logField}
                    <FormGroup>
                        <Button color="primary" type="submit">Save</Button>{' '}
                        <Button color="secondary" tag={Link} to="/shipyard">Cancel</Button>
                    </FormGroup>
                </Form>
                {previousLogs}
            </Container>
        </div>
    );
}

export default ShipEdit;
