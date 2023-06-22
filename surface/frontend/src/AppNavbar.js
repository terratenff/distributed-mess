import { Navbar, NavbarBrand } from 'reactstrap';
import { Link } from 'react-router-dom';

/**
 * Creates a navigation menu at the top of each page of the application.
 * @returns AppNavbar.
 */
function AppNavbar() {

    return (
        <Navbar color="dark" dark expand="md">
            <NavbarBrand tag={Link} to="/">Home</NavbarBrand>
            <NavbarBrand tag={Link} to="/shipyard">Shipyard</NavbarBrand>
            <NavbarBrand tag={Link} to="/mission-control">Mission Control</NavbarBrand>
            <NavbarBrand tag={Link} to="/mission-log">Mission Log</NavbarBrand>
            <NavbarBrand tag={Link} to="/about">About</NavbarBrand>
        </Navbar>
    );
}

export default AppNavbar;
