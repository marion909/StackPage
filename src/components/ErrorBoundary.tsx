import { Component, type ErrorInfo, type ReactNode } from "react";

const TELEMETRY_KEY = "stackpage_telemetry_opt_in";

export function isTelemetryEnabled(): boolean {
  return localStorage.getItem(TELEMETRY_KEY) === "true";
}

export function setTelemetryEnabled(enabled: boolean): void {
  localStorage.setItem(TELEMETRY_KEY, enabled ? "true" : "false");
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  reported: boolean;
}

/**
 * Top-level React error boundary.
 * Catches unhandled render errors and shows a friendly recovery screen.
 * If telemetry is opted in, the user can send a basic report (console log
 * placeholder — wire up a real endpoint as needed).
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, reported: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("[StackPage] Uncaught error:", error, errorInfo);

    if (isTelemetryEnabled()) {
      // TODO: replace with your real crash-reporting endpoint
      console.info("[StackPage] Telemetry: sending crash report (placeholder)", {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        version: "0.1.0",
      });
    }
  }

  handleReport = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    const report = [
      `StackPage crash report`,
      `Version: 0.1.0`,
      `Time: ${new Date().toISOString()}`,
      ``,
      `Error: ${error.message}`,
      ``,
      `Stack:`,
      error.stack ?? "(none)",
      ``,
      `Component stack:`,
      errorInfo?.componentStack ?? "(none)",
    ].join("\n");

    // Copy to clipboard for easy sharing
    navigator.clipboard.writeText(report).then(() => {
      this.setState({ reported: true });
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, reported } = this.state;

    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
        <div className="max-w-lg w-full bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-[#1e293b] mb-2">
            Something went wrong
          </h1>
          <p className="text-[#64748b] text-sm mb-4">
            StackPage encountered an unexpected error. Your work may have been saved already.
          </p>

          {error && (
            <pre className="bg-[#f1f5f9] border border-[#e2e8f0] rounded-lg p-3 text-xs text-[#ef4444] overflow-auto max-h-40 mb-6 whitespace-pre-wrap">
              {error.message}
            </pre>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={this.handleReload}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Reload StackPage
            </button>
            <button
              onClick={this.handleReport}
              disabled={reported}
              className="border border-[#e2e8f0] hover:border-[#2563eb] hover:text-[#2563eb] text-[#64748b] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {reported ? "✓ Copied to clipboard" : "Copy crash report"}
            </button>
          </div>

          <p className="text-xs text-[#94a3b8] mt-4">
            You can help improve StackPage by sharing the crash report.
          </p>
        </div>
      </div>
    );
  }
}
