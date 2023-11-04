import { Container } from 'reactstrap';
import AppNavbar from "./AppNavbar";

import LogPagination from "./components/LogPagination";
import AppFooter from './AppFooter';

/**
 * Creates the mission log page of the application.
 * @returns Mission log page.
 */
function MissionLog() {

    return (
        <div>
            <AppNavbar/>
            <Container fluid className="page-fill">
                <h3>Mission Log</h3>
                <p>Activities of the ships are logged to the table below.</p>
                <h4>Active ship-specific Logs</h4>
                <LogPagination urlPrefix={"/space/logs"} />
                <h4>Active mission-specific Logs</h4>
                <LogPagination urlPrefix={"/space/events"} />
                <h4>Past ship-specific Logs</h4>
                <LogPagination urlPrefix={"/logs"} />
                <h4>Past mission-specific Logs</h4>
                <LogPagination urlPrefix={"/events"} />
            </Container>
            <AppFooter/>
        </div>
    );
}

export default MissionLog;
