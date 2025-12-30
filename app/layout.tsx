import "./globals.css";

export const metadata = {
  title: "CreatorHub",
  description: "Plataforma de parcerias entre creators e patrocinadores",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="bg-transparent text-slate-900 antialiased">{children}</body>
    </html>
  );
}
