import React, { useState, useEffect, useRef } from 'react';
import { Button, ButtonGroup, Container, Table, Alert } from 'reactstrap';
import { Link } from 'react-router-dom';
import AppNavbar from './AppNavbar';

function ShipList() {

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
                setNoConnection(true);
            });
    }

    async function remove(id) {
        await fetch(`/ships/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(() => {
            let updatedShips = [...ships].filter(i => i.id !== id);
            setShips(updatedShips);
        });
    }

    const NO_CONNECTION_JSX = (<Alert color="danger">Error: no connection to server.</Alert>);

    const [ships, setShips] = useState([]);
    const [noConnection, setNoConnection] = useState(true);

    const initialized = useRef(false);

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
        const disableChanges = ship.status === "READY" ? false : true;
        const opts = {"disabled": disableChanges};
        return <tr key={ship.id}>
            <td style={{whiteSpace: 'nowrap'}}>{ship.name}</td>
            <td>{ship.status}</td>
            <td>{ship.condition}</td>
            <td>{ship.peakCondition}</td>
            <td>
                <ButtonGroup>
                    <Button size="sm" color="primary" tag={Link} to={"/shipyard/" + ship.id} {...opts}>Edit</Button>
                    <Button size="sm" color="danger" onClick={() => remove(ship.id)} {...opts}>Delete</Button>
                </ButtonGroup>
            </td>
        </tr>
    });

    return (
        <div>
            <AppNavbar/>
            <Container fluid>
                {noConnection ? NO_CONNECTION_JSX : ""}
                <h3>Shipyard</h3>
                <div>
                    <Button color="primary" tag={Link} to="/shipyard/new">Add Ship</Button>
                </div>
                <Table borderless hover>
                    <thead>
                    <tr>
                        <th width="20%">Name</th>
                        <th width="20%">Status</th>
                        <th width="20%">Current Condition</th>
                        <th width="20%">Peak Condition</th>
                        <th width="20%">Controls</th>
                    </tr>
                    </thead>
                    <tbody>
                    {shipList}
                    </tbody>
                </Table>
            </Container>
        </div>
    );
}

export default ShipList;
