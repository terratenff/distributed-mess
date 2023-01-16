import React, { Component } from 'react';
import { Button, ButtonGroup, Container, Table } from 'reactstrap';
import AppNavbar from './AppNavbar';
import { Link } from 'react-router-dom';

class ShipList extends Component {

    constructor(props) {
        super(props);
        this.state = {ships: []};
        this.remove = this.remove.bind(this);
    }

    componentDidMount() {
        fetch('/ships')
            .then(response => response.json())
            .then(data => this.setState({ships: data}));
    }

    async remove(id) {
        await fetch(`/ships/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(() => {
            let updatedShips = [...this.state.ships].filter(i => i.id !== id);
            this.setState({ships: updatedShips});
        });
    }

    render() {
        const {ships} = this.state;

        const shipList = ships.map(ship => {
            return <tr key={ship.id}>
                <td style={{whiteSpace: 'nowrap'}}>{ship.name}</td>
                <td>{ship.status}</td>
                <td>{ship.condition}</td>
                <td>{ship.peakCondition}</td>
                <td>
                    <ButtonGroup>
                        <Button size="sm" color="primary" tag={Link} to={"/ships/" + ship.id}>Edit</Button>
                        <Button size="sm" color="danger" onClick={() => this.remove(ship.id)}>Delete</Button>
                    </ButtonGroup>
                </td>
            </tr>
        });

        return (
            <div>
                <AppNavbar/>
                <Container fluid>
                    <div className="float-right">
                        <Button color="success" tag={Link} to="/ships/new">Add Ship</Button>
                    </div>
                    <h3>Ships</h3>
                    <Table className="mt-4">
                        <thead>
                        <tr>
                            <th width="30%">Name</th>
                            <th width="30%">Status</th>
                            <th width="20%">Current Condition</th>
                            <th width="20%">Peak Condition</th>
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
}
export default ShipList;