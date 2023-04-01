import { Component } from "react";
import { Container } from 'reactstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AppNavbar from "./AppNavbar";

class About extends Component {

    constructor(props) {
        super(props);
        this.state = {ships: []};
    }

    componentDidMount() {
        fetch('/ships')
            .then(response => response.json())
            .then(data => this.setState({ships: data}));
    }

    render() {
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
}

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        return (
            <Component
                {...props}
                router={{ location, navigate, params }}
            />
        );
    }
  
    return ComponentWithRouterProp;
  }

export default withRouter(About);