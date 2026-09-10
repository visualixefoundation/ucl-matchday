import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display"
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Matchday — UEFA Champions League",
  description: "Fixtures, live scores, results and highlights for the Champions League."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${inter.variable}`}>
        <header className="site-header">
          <div className="wrap site-header__inner">
            <a href="/" className="wordmark">
              Matchday <span className="wordmark__sub">Champions League</span>
            </a>
            <nav className="site-nav">
              <a href="/">Fixtures &amp; Scores</a>
              <a href="/standings">Standings</a>
              <a href="/results">Results &amp; Highlights</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            Scores and highlights via Highlightly. Not affiliated with UEFA.
          </div>
        </footer>
      </body>
    </html>
  );
}
