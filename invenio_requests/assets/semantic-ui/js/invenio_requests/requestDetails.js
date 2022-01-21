import React, { Component } from "react";
import PropTypes from "prop-types";
import { Tab } from "semantic-ui-react";
import ReactDOM from "react-dom";

class RequestDetails extends Component {
  menuPanes = [
    { menuItem: "Timeline", render: () => <Tab.Pane>TIMELINE</Tab.Pane> },
    { menuItem: "Record", render: () => <Tab.Pane>Record</Tab.Pane> }
  ];

  render() {
    return <Tab panes={this.menuPanes} />;
  }
}

ReactDOM.render(<RequestDetails />, document.getElementById("request-detail"));

export default RequestDetails;
