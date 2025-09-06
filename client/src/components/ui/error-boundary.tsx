import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import BasicButton from "./basic-button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto text-center px-4">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-3">
            Something went wrong
          </h1>
          <p className="text-lg font-light text-gray-600 dark:text-gray-400">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 text-left border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Error details:</p>
          <p className="text-sm text-red-600 dark:text-red-400 font-mono break-all  dark:bg-red-900/20 p-3 rounded-lg">
            {error.message}
          </p>
        </div>

        <div className="space-y-4">
          <BasicButton
            onClick={resetError}
            className="w-full py-3 text-base font-normal"
          >
            Try Again
          </BasicButton>
          <BasicButton
            onClick={() => window.location.reload()}
            className="w-full py-3 text-base font-normal bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            Reload Page
          </BasicButton>
        </div>
      </div>
    </div>
  );
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16  rounded-full flex items-center justify-center ">
        <AlertTriangle className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-6">
        Error Loading Content
      </h2>
   
      <BasicButton
        onClick={resetError}
        className="px-6 py-2 text-sm font-normal"
      >
        Try Again
      </BasicButton>
    </div>
  );
}