import React, { Component } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import AppNavbar from './AppNavbar';

class ShipEdit extends Component {

    emptyItem = {
        name: '',
        status: '',
        condition: 0,
        peakCondition: 100
    };

    constructor(props) {
        super(props);
        this.state = {
            item: this.emptyItem
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        if (this.props.router.params.id !== 'new') {
            const ship = await (await fetch(`/ships/${this.props.router.params.id}`)).json();
            this.setState({item: ship});
        }
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        let item = {...this.state.item};
        item[name] = value;
        this.setState({item});
    }

    async handleSubmit(event) {
        event.preventDefault();
        const {item} = this.state;
    
        await fetch('/ships' + (item.id ? '/' + item.id : ''), {
            method: (item.id) ? 'PUT' : 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item),
        });
        this.props.router.navigate('/ships');
    }

    render() {
        const {item} = this.state;
        const title = <h2>{item.id ? 'Edit Ship' : 'Add Ship'}</h2>;
    
        return <div>
            <AppNavbar/>
            <Container>
                {title}
                <Form onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Label for="name">Name</Label>
                        <Input type="text" name="name" id="name" value={item.name || ''}
                               onChange={this.handleChange} autoComplete="name"/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="status">Status</Label>
                        <Input type="text" name="status" id="status" value={item.status || ''}
                               onChange={this.handleChange} autoComplete="status"/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="condition">Condition</Label>
                        <Input type="text" name="condition" id="condition" value={item.condition || ''}
                               onChange={this.handleChange} autoComplete="condition"/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="pcondition">Peak Condition</Label>
                        <Input type="text" name="pcondition" id="pcondition" value={item.peakCondition || ''}
                               onChange={this.handleChange} autoComplete="pcondition"/>
                    </FormGroup>
                    <FormGroup>
                        <Button color="primary" type="submit">Save</Button>{' '}
                        <Button color="secondary" tag={Link} to="/ships">Cancel</Button>
                    </FormGroup>
                </Form>
            </Container>
        </div>
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

export default withRouter(ShipEdit);