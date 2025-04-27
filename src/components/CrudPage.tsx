"use client";

import React from "react";

interface CrudPageProps {
  entityName: string;
  columns: string[];
}

export function CrudPage({ entityName, columns }: CrudPageProps) {
  return (
    <section style={{ padding: "2rem", color: "#e2e8f0", backgroundColor: "#0f172a", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#38bdf8", marginBottom: "1.5rem" }}>{entityName}</h1>

      <form style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        {columns.map((col) => (
          <div key={col} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.875rem", color: "#94a3b8" }}>{col}</label>
            <input
              type="text"
              name={col}
              placeholder={col}
              disabled
              style={{
                padding: "0.5rem",
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "0.5rem",
                color: "#cbd5e1",
              }}
            />
          </div>
        ))}
        <button
          type="submit"
          disabled
          style={{
            padding: "0.75rem",
            backgroundColor: "#0ea5e9",
            border: "none",
            borderRadius: "0.5rem",
            color: "white",
            fontWeight: "bold",
            cursor: "not-allowed",
            marginTop: "1rem",
          }}
        >
          Guardar
        </button>
      </form>

      <div style={{ overflowX: "auto", borderRadius: "0.5rem", backgroundColor: "#1e293b" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead style={{ backgroundColor: "#334155" }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    color: "#cbd5e1",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                  }}
                >
                  {col}
                </th>
              ))}
              <th
                style={{
                  padding: "0.75rem 1rem",
                  textAlign: "left",
                  color: "#cbd5e1",
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                }}
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: "#1e293b", borderTop: "1px solid #334155" }}>
              {columns.map((col) => (
                <td key={col} style={{ padding: "0.75rem 1rem", color: "#94a3b8" }}>
                  -
                </td>
              ))}
              <td style={{ padding: "0.75rem 1rem", color: "#94a3b8" }}>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
