// src/components/ErrorBoundary.jsx
import React, { Component } from "react";
import ErrorScreen from "./ErrorScreen";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          type="default"
          title="Something went wrong"
          errorDetails={this.state.error.toString()}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;