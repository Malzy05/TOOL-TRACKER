import './globals.css';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

import { AppProvider } from '@/components/AppProvider';

export const metadata = {
  title: 'Tool Tracking Mycopter Aviation',
  description: 'Manage tool and calibration also for loan & return',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scrollbar-thin">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/index.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/plus-jakarta-sans@5.0.0/index.css" />
      </head>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
