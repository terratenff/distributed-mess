import { useState, useEffect, useRef } from "react";
import { Container, Table, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import AppNavbar from "./AppNavbar";

function MissionLog() {

    async function fetchShipLogs() {
        const fetchedShipLogs = await (await fetch("/logs?page=" + pageLogs.current)).json();
        setShipLogs(fetchedShipLogs.reverse());
    }

    async function fetchMissionEvents() {
        const fetchedMissionEvents = await (await fetch("/events?page=" + pageEvents.current)).json();
        setMissionEvents(fetchedMissionEvents.reverse());
    }

    async function getLogCount() {
        const fetchedShipLogs = await (await fetch("/logs")).json();
        logPageCount.current = Math.ceil(fetchedShipLogs.length / limit);
    }

    async function getEventCount() {
        const fetchedMissionEvents = await (await fetch("/events")).json();
        eventPageCount.current = Math.ceil(fetchedMissionEvents.length / limit);
    }

    async function moveLogPagination(target) {
        if (target >= 0 && target < logPageCount.current) {
            pageLogs.current = target;
            fetchShipLogs();
        }
    }

    async function moveEventPagination(target) {
        if (target >= 0 && target < eventPageCount.current) {
            pageEvents.current = target;
            fetchMissionEvents();
        }
    }

    function generatePaginationIndices(currentIndex, pageCount) {
        let iMin = currentIndex - 3;
        let iMax = currentIndex + 3;
        if (iMin < 0) {
            iMin = 0;
        }
        if (iMax > pageCount) {
            iMax = pageCount;
        }

        let paginationIndices = [];
        for (let i = iMin; i < iMax; i++) {
            paginationIndices.push(i);
        }

        return paginationIndices;
    }

    const limit = 10;

    const [shipLogs, setShipLogs] = useState([]);
    const [missionEvents, setMissionEvents] = useState([]);

    const initialized = useRef(false);
    const logPageCount = useRef(0);
    const eventPageCount = useRef(0);
    const pageLogs = useRef(0);
    const pageEvents = useRef(0);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            getLogCount();
            getEventCount();
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

    const logPaginationCore = generatePaginationIndices(pageLogs.current, logPageCount.current).map(i => {
        let active = {"active": pageLogs.current === i};
        return (
            <PaginationItem {...active} key={i}>
                <PaginationLink onClick={() => moveLogPagination(i)}>{i + 1}</PaginationLink>
            </PaginationItem>
        );
    });
    const logPagination = (
        <Pagination size="lg" style={{display: "flex", justifyContent: "center"}}>
            <PaginationItem>
                <PaginationLink first onClick={() => moveLogPagination(0)}/>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink previous onClick={() => moveLogPagination(pageLogs.current - 1)}/>
            </PaginationItem>
            {logPaginationCore}
            <PaginationItem>
                <PaginationLink next onClick={() => moveLogPagination(pageLogs.current + 1)}/>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink last onClick={() => moveLogPagination(logPageCount.current - 1)}/>
            </PaginationItem>
        </Pagination>
    );

    const eventPaginationCore = generatePaginationIndices(pageEvents.current, eventPageCount.current).map(i => {
        let active = {"active": pageEvents.current === i};
        return (
            <PaginationItem {...active} key={i}>
                <PaginationLink onClick={() => moveEventPagination(i)}>{i + 1}</PaginationLink>
            </PaginationItem>
        );
    });
    const eventPagination = (
        <div>
        <Pagination size="lg" style={{display: "flex", justifyContent: "center"}}>
            <PaginationItem>
                <PaginationLink first onClick={() => moveEventPagination(0)}/>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink previous onClick={() => moveEventPagination(pageEvents.current - 1)}/>
            </PaginationItem>
            {eventPaginationCore}
            <PaginationItem>
                <PaginationLink next onClick={() => moveEventPagination(pageEvents.current + 1)}/>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink last onClick={() => moveEventPagination(eventPageCount.current - 1)}/>
            </PaginationItem>
        </Pagination>
        </div>
    );

    return (
        <div>
            <AppNavbar/>
            <Container fluid>
                <h3>Mission Log</h3>
                <p>Activities of the ships are logged to the table below.</p>
                <h4>Ship-specific Logs</h4>
                {logPagination}
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
                {eventPagination}
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
