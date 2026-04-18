import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Startup Judge',
  description: 'WhatsApp-Based Startup Mentor',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="bg-[#050508] text-[#f8fafc] font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
