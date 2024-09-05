import React from "react";
import { ErrorBoundary } from "react-error-boundary";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};

const ErrorBoundaryWrapper = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryWrapper;
