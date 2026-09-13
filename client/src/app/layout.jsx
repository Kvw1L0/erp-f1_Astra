import '../styles/globals.css';
import { SocketProvider } from '../context/SocketContext';

export const metadata = {
  title: 'ERP Formula 1 | NetSuite Gamification & Live Telemetry',
  description: 'Aplicación web interactiva en tiempo real para eventos corporativos y capacitación ERP con temática de Fórmula 1 y Cultura Pits.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-carbon min-h-screen text-slate-100 antialiased selection:bg-f1-red selection:text-white">
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
