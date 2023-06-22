import { useState } from "react";
import { Button, Offcanvas, OffcanvasHeader, OffcanvasBody } from "reactstrap";
import { HashLink } from "react-router-hash-link";

/**
 * Creates a button that allows the user to navigate by headers around the home page of the application.
 * @returns HomeNav button.
 */
function HomeNav() {

    const [open, setOpen] = useState(false);

    return (
    <div>
        <Button color="primary" onClick={() => setOpen(true)} style={{position: "fixed", bottom: "10px", left: "10px", zIndex: "1"}}>Navigation</Button>
        <Offcanvas toggle={() => setOpen(false)} isOpen={open}>
            <OffcanvasHeader toggle={() => setOpen(false)}>
                Home Navigation
            </OffcanvasHeader>
            <OffcanvasBody>
                <HashLink smooth to="#surface-title">Surface</HashLink><br/>
                <HashLink smooth to="#available-ships-title">Available Ships</HashLink><br/>
                <HashLink smooth to="#active-ships-title">Active Ships</HashLink><br/>
                <HashLink smooth to="#ship-events-title">Ship Events</HashLink><br/>
                <HashLink smooth to="#mission-events-title">Mission Events</HashLink><br/>
            </OffcanvasBody>
        </Offcanvas>
    </div>);
}

export default HomeNav;