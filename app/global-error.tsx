"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <main
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1rem",
            padding: "1.5rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1>Un problème est survenu</h1>
          <p>Nabda n’a pas pu charger cette page pour le moment.</p>
          <button type="button" onClick={reset}>
            Réessayer
          </button>
          <a href="/home">Retour à l’accueil</a>
        </main>
      </body>
    </html>
  );
}
