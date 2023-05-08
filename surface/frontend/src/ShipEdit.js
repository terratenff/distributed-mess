import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
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

    const shipId = useParams();

    useEffect(() => {
        fetchShip(shipId.id)
    }, [shipId.id]);

    const title = <h2>{ship.id ? 'Edit Ship' : 'Add Ship'}</h2>;

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
                    <FormGroup>
                        <Button color="primary" type="submit">Save</Button>{' '}
                        <Button color="secondary" tag={Link} to="/shipyard">Cancel</Button>
                    </FormGroup>
                </Form>
            </Container>
        </div>
    );
}

export default ShipEdit;
