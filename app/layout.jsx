import './globals.css';

export const metadata = {
  title: 'Vedic Mind Engine',
  description: 'Master Vedic Math with step-by-step interactive practice',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
