import { Container } from 'reactstrap';
import AppNavbar from "./AppNavbar";

/**
 * Creates the about page of the application.
 * @returns About page.
 */
function About() {
    return (
        <div>
            <AppNavbar/>
            <Container fluid>
                <h3>About</h3>
                <p>General information about this module and the project in general here.</p>
            </Container>
        </div>
    );
}

export default About;
