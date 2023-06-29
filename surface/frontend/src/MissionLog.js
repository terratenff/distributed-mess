import { Container } from 'reactstrap';
import AppNavbar from "./AppNavbar";

import LogPagination from "./components/LogPagination";

/**
 * Creates the mission log page of the application.
 * @returns Mission log page.
 */
function MissionLog() {

    return (
        <div>
            <AppNavbar/>
            <Container fluid>
                <h3>Mission Log</h3>
                <p>Activities of the ships are logged to the table below.</p>
                <h4>Ship-specific Logs</h4>
                <LogPagination urlPrefix={"/logs"} />
                <h4>Mission-specific Logs</h4>
                <LogPagination urlPrefix={"/events"} />
            </Container>
        </div>
    );
}

export default MissionLog;
