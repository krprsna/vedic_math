import './globals.css';

export const metadata = {
  title: 'Vedic Math Engine',
  description: 'Master step-by-step mental arithmetic',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
