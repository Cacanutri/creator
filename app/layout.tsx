import "./globals.css";

export const metadata = {
  title: "CreatorAds Hub",
  description: "MVP de parcerias entre creators e marcas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="bg-transparent text-zinc-50">{children}</body>
    </html>
  );
}
