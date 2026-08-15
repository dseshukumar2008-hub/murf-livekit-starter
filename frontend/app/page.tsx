import { headers } from 'next/headers';
import { getAppConfig } from '@/lib/utils';
import { ClientPage } from './client-page';

export default async function Page() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return <ClientPage appConfig={appConfig} />;
}
