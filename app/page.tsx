import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Umevio",
  description: "Umevio — performance marketing studio.",
};

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF6F0",
        color: "#141010",
        fontFamily: "var(--font-outfit), sans-serif",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontFamily: "var(--font-dmserif), serif", fontSize: 34, fontWeight: 400, marginBottom: 10, letterSpacing: "-0.02em" }}>
          Umevio
        </h1>
        <div style={{ height: 3, width: 48, background: "#D94F3D", borderRadius: 2, margin: "0 auto 14px" }} />
        <p style={{ color: "#A89880", fontSize: 14 }}>Landing pages coming soon.</p>
      </div>
    </main>
  );
}
