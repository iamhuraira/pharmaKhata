import '@/styles/global.css';
import 'react-circular-progressbar/dist/styles.css';

import type { Metadata } from 'next';

import ProviderRedux from '@/redux/ProviderRedux';
import TanstackProvider from '@/TanStack/TanStackProvider';

import { ConfigProvider } from 'antd';

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export default function RootLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className='mx-auto max-w-[1920px]'>
        <ProviderRedux>
          <TanstackProvider>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#4CAF50',
                  colorLink: '#4CAF50',
                  colorSuccess: '#10B981',
                  colorWarning: '#F59E0B',
                  colorError: '#EF4444',
                },
              }}
            >
              {props.children}
            </ConfigProvider>
          </TanstackProvider>
        </ProviderRedux>
      </body>
    </html>
  );
}
