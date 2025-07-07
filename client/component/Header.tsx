import React from "react";

export const Header = () => {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        display: "flex",
        gap: 8,
        padding: 8,
        alignItems: "center",
        backgroundColor: "#434242",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 24 }}>
        nBSON Editor
      </h1>
      <div style={{ flexGrow: 1 }} />
      <a href="https://github.com/narumincho/bson-editor">GitHub</a>
    </header>
  );
};
