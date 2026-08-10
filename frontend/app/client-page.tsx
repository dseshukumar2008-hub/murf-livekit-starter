'use client';

import dynamic from 'next/dynamic';
import type { AppConfig } from '@/app-config';

const App = dynamic(() => import('@/components/app/app').then((m) => m.App), { ssr: false });

export function ClientPage({ appConfig }: { appConfig: AppConfig }) {
  return <App appConfig={appConfig} />;
}
