import { Component } from "react";
import { Container, Table } from 'reactstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AppNavbar from "./AppNavbar";

class MissionLog extends Component {

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
                    <h3>Mission Log</h3>
                    <p>Activities of the ships are logged to the table below.</p>
                    <Table borderless hover>
                        <thead>
                        <tr>
                            <th width="30%">Timestamp</th>
                            <th width="20%">Ship Information</th>
                            <th width="50%">Activity</th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </Table>
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

export default withRouter(MissionLog);