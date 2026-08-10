import { headers } from 'next/headers';
import { ClientPage } from './client-page';
import { getAppConfig } from '@/lib/utils';

export default async function Page() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return <ClientPage appConfig={appConfig} />;
}
