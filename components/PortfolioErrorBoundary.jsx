"use client";

import { Component } from "react";

export default class PortfolioErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Portfolio render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "#0a0604",
          }}
        >
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <p
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: 14,
                letterSpacing: "0.2em",
                color: "#FF7A29",
                marginBottom: 12,
              }}
            >
              JS-OS · runtime error
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.85)",
                marginBottom: 16,
              }}
            >
              {this.state.error?.message || "Something went wrong loading the portfolio."}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: 13,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#FF7A29",
                background: "rgba(255, 122, 41, 0.12)",
                border: "1px solid rgba(255, 122, 41, 0.5)",
                borderRadius: 2,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
