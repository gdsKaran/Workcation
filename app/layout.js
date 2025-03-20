import "./globals.css";

export const metadata = {
  title: "Workcation, A Community based App",
  description: "Connecting People Across Faiths & Interests",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
