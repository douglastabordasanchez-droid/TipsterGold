import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("App crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            background: "#0a0a0a",
            color: "#ffffff",
            fontFamily: "Inter, system-ui, sans-serif",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px" }}>⚠️</div>
          <h1 style={{ fontSize: "20px", fontWeight: 800 }}>Ocurrió un error al cargar la página</h1>
          <p style={{ color: "#b3b3b3", maxWidth: "480px", fontSize: "14px" }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#00ff66",
              color: "#0a0a0a",
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
