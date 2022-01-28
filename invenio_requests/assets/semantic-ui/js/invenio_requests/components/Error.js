import React, { Component } from "react";
import Overridable from "react-overridable";
import { Message } from "semantic-ui-react";
import PropTypes from "prop-types";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log error messages to an error reporting service here
  }

  render() {
    const { children } = this.props;
    const {error, errorInfo} = this.state;
    if (errorInfo !== undefined && errorInfo) {
      return (
        <Overridable id="ErrorBoundary.layout" {...this.props}>
          <Message negative>
            <Message.Header>Something went wrong</Message.Header>
            <p>
              {error && error.toString()}
              <br />
              {errorInfo.componentStack}
            </p>
          </Message>
        </Overridable>
      );
    }
    return children;
  }
}

ErrorBoundary.propTypes = {
  error: PropTypes.bool,
  children: PropTypes.node
};

ErrorBoundary.defaultProps = {
  error: null,
  children: null
};

export default Overridable.component("ErrorBoundary", ErrorBoundary);
