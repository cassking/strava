import React, { Component } from "react";
import { Linking } from "react-native";
import hoistStatics from "hoist-non-react-statics";
import PropTypes from "prop-types";

function getPathAndQuery(prefix, url) {
  return url.indexOf(prefix) === -1 ? url : url.replace(prefix, "");
}

export default prefix => WrappedComponent => {
  class DeeplinkingContainer extends Component {
    static contextTypes = {
      store: PropTypes.object
    };

    componentDidMount() {
      Linking.getInitialURL()
        .then(this.handleOpenURL)
        .catch(err => {
          // eslint no-console: "error"
          console.error("[Deep linking] An error occurred ", err);
        });
      Linking.addEventListener("url", this.handleOpenURL);
    }

    componentWillUnmount() {
      Linking.removeEventListener("url", this.handleOpenURL);
    }

    handleOpenURL = event => {
      if (event && event.url) {
        const navigationAction = WrappedComponent.router.getActionForPathAndParams(
          getPathAndQuery(prefix, event.url)
        );
        if (navigationAction) {
          this.context.store.dispatch(navigationAction);
        } else {
          console.warn(
            `[Deep linking] couldn't find a matching route for the url sheme "${event.url}"`
          );
        }
      }
    };

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  return hoistStatics(DeeplinkingContainer, WrappedComponent);
};
