import "./globals.css";

export const metadata = {
  title: "CreatorAds Hub",
  description: "MVP de campanhas entre creators e marcas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="bg-zinc-950 text-zinc-50">{children}</body>
    </html>
  );
}
