import { Container } from 'reactstrap';
import AppNavbar from "./AppNavbar";
import AppFooter from './AppFooter';

/**
 * Creates the about page of the application.
 * @returns About page.
 */
function About() {
    return (
        <div>
            <AppNavbar/>
            <Container fluid className="page-fill">
                <h3>About</h3>
                <p>This is the surface module. Here ships are sent to space.</p>
                <div className='left-aligned'>
                    <h4>How to create a new ship</h4>
                    <p>
                        New ships can be created in the shipyard page.
                        Click the button "Add Ship" at the top, and give it necessary information.
                        Status information is controlled by the application, so it should not be edited manually.
                        Click "Save" button to finish ship creation.
                    </p>
                    <h4>How to edit ships</h4>
                    <p>
                        Existing ships can be edited at the shipyard page, using the "Edit" button for each ship.
                        One can add a ship log manually this way.
                        Ships can only be edited if their status value is "READY".
                    </p>
                    <h4>How to delete ships</h4>
                    <p>
                        Ships can be deleted at the shipyard page, using the "Delete" button for each ship.
                        Ships can only be deleted if their status value is "READY".
                    </p>
                    <h4>How to send ships to space</h4>
                    <p>Ships are sent to space using the following steps:</p>
                    <ol>
                        <li>Go to the mission control page.</li>
                        <li>Select a ship.</li>
                        <li>Assign a mission for the ship. Doing so highlights the ship in the mission control page.</li>
                        <li>Launch ship.</li>
                    </ol>
                    <p>The ship will then await launch at the launch site, where only one ship can be launched at a time.</p>
                    <h4>How to abort missions</h4>
                    <p>
                        To abort a mission, go to the mission control page, select the ship in question and click "Abort Mission".
                        A ship's mission can only be aborted if it has not reached space yet.
                    </p>
                    <h4>How to repair ships</h4>
                    <p>
                        Go to the mission control page, select a damaged ship and click "Conduct Repairs".
                        Only one ship can be repaired at a time, so if multiple ships need repair, they are put in a queue.
                        If a ship is awaiting repairs, it is possible to abort repairs by clicking "Abort Repairs".
                        (Note that this button appears in place of the "Conduct Repairs" button)
                        If a ship is in the middle of repairs, the repairs cannot be aborted.
                    </p>
                    <h4>How to decommission ships</h4>
                    <p>
                        If a ship is not needed anymore (but there is no desire to delete it), it can be decommissioned.
                        Go to the mission control page, select the ship and click "Decommission Ship".
                        The ship must have "READY" as its status value in order to decommission it.
                    </p>
                    <h4>About general controls</h4>
                    <p>
                        There are three general control categories that affect all ships. They are as follows:
                    </p>
                    <ul>
                        <li>
                            General controls: Four buttons that affect most/all ships.
                            <ul>
                                <li>Launch Assigned Ships: Launches every single ship that is "READY" and has a mission.</li>
                                <li>
                                    Send Unassigned Ships to Repairs: Every single ship that is unassigned and is eligible for repairs
                                    is sent to the drydock for repairs.
                                </li>
                                <li>
                                    Unassign Assigned Ships: Every single ship that has a mission, is unassigned.
                                    If only one or few ships need to be unassigned, that can be done by selecting said ships
                                    and clicking "Unassign Mission" (this button should appear if a ship is assigned with a mission).
                                </li>
                                <li>
                                    Abort All Missions: All ships that are on their way to space (but have not reached it yet)
                                    are instructed to abort their missions and come back.
                                </li>
                            </ul>
                        </li>
                        <li>
                            Ship load quantity: Selected number represents how many ships are loaded in for the user to view.
                            This affects ship filtering: if the threshold is exceeded, filter query needs to be finished by
                            hitting Enter. Otherwise filter query results are updated as something is typed.
                        </li>
                        <li>Filter ships: This text field can be used to search for ships by name.</li>
                    </ul>
                </div>
            </Container>
            <AppFooter/>
        </div>
    );
}

export default About;
