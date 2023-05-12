import { useState, useEffect, useRef } from "react";
import { Container, Table } from 'reactstrap';
import AppNavbar from "./AppNavbar";

function MissionLog() {

    async function fetchShipLogs() {
        const fetchedShipLogs = await (await fetch("/logs")).json();
        setShipLogs(fetchedShipLogs.reverse());
    }

    async function fetchMissionEvents() {
        const fetchedMissionEvents = await (await fetch("/events")).json();
        setMissionEvents(fetchedMissionEvents.reverse());
    }

    const [shipLogs, setShipLogs] = useState([]);
    const [missionEvents, setMissionEvents] = useState([]);

    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchShipLogs();
            fetchMissionEvents();
        }
    });

    const shipLogContents = shipLogs.map((log) => {
        return (
            <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td>{log.description}</td>
            </tr>
        );
    });

    const missionEventContents = missionEvents.map((log) => {
        return (
            <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td>{log.description}</td>
            </tr>
        );
    });

    return (
        <div>
            <AppNavbar/>
            <Container fluid>
                <h3>Mission Log</h3>
                <p>Activities of the ships are logged to the table below.</p>
                <h4>Ship-specific Logs</h4>
                <Table borderless hover style={{textAlign: "left"}}>
                    <thead>
                    <tr>
                        <th width="20%">Timestamp</th>
                        <th width="80%">Description</th>
                    </tr>
                    </thead>
                    <tbody>
                        {shipLogContents}
                    </tbody>
                </Table>
                <h4>Mission-specific Logs</h4>
                <Table borderless hover style={{textAlign: "left"}}>
                    <thead>
                    <tr>
                        <th width="20%">Timestamp</th>
                        <th width="80%">Description</th>
                    </tr>
                    </thead>
                    <tbody>
                        {missionEventContents}
                    </tbody>
                </Table>
                </Container>
        </div>
    );
}

export default MissionLog;
