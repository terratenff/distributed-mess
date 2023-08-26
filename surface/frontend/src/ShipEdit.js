import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Form, FormGroup, Input, Label, Table } from 'reactstrap';
import AppNavbar from './AppNavbar';
import AppFooter from './AppFooter';

/**
 * Creates the ship editing page of the application. Also operates as the ship creation page.
 * @returns Ship editing/creation page.
 */
function ShipEdit() {

    const CONDITION_LIMIT = 500;
    const NAME_LIMIT = 50;
    const DESCRIPTION_LIMIT = 255;

    /**
     * Fetches a specific ship from the application and updates the component with it. Alternatively a template ship is used.
     * @param {*} targetShipId ID of the ship that is to be fetched, or "new", in which case a template is used.
     */
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

    /**
     * Updates maintained ship entity.
     * @param {*} event Change event that came from editing a form.
     */
    function handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        let item = {...ship};
        item[name] = value;
        setShip(item);
    }

    /**
     * Updates maintained ship log entity.
     * @param {*} event Change event that came from editing a form.
     */
    function handleLogChange(event) {
        const target = event.target;
        const value = target.value;
        let keyValue = {"description": value};
        setLogEntry(keyValue);
    }

    /**
     * Validates and sends the contents of the form to the backend for processing, and redirects user back to the ship list page.
     * @param {*} event Click event.
     */
    async function handleSubmit(event) {
        event.preventDefault();

        if (ship.condition > CONDITION_LIMIT || ship.peakCondition > CONDITION_LIMIT) {
            alert("(Peak) Condition cannot be higher than " + CONDITION_LIMIT + ".");
            return;
        }

        if (ship.condition > ship.peakCondition) {
            alert("Peak condition cannot be lower than current condition.");
            return;
        }

        if (ship.condition < 0 || ship.peakCondition < 0) {
            alert("(Peak) Condition cannot be negative.");
            return;
        }

        if (ship.name.length > NAME_LIMIT) {
            alert("Ship name length must be " + NAME_LIMIT + " characters or lower.");
            return;
        }

        if (ship.description.length > DESCRIPTION_LIMIT) {
            alert("Ship description length must be " + DESCRIPTION_LIMIT + " characters or lower.");
            return;
        }

        if (ship.id && logEntry["description"].length > 0) {
            if (logEntry["description"].length > DESCRIPTION_LIMIT) {
                alert("Log description length must be " + DESCRIPTION_LIMIT + " characters or lower.");
                return;
            }
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
            <Container className="page-fill">
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
            <AppFooter/>
        </div>
    );
}

export default ShipEdit;
