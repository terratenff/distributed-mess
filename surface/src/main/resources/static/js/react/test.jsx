'use strict';

class TestContent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {testState: "hello"};
		this.box = (
		<div style={{backgroundColor: "green"}}>
			<p>Text from testState: {this.state.testState}</p>
		</div>
		);
	}
	
	render() {
		return this.box;
	}
}

console.log("Test");
ReactDOM.render(
	React.createElement(TestContent),
	document.querySelector("#sample")
);
