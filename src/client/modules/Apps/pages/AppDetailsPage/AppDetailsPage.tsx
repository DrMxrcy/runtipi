import { NextPage } from 'next';
import React from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import type { MessageKey } from '@/server/utils/errors';
import { Layout } from '../../../../components/Layout';
import { ErrorPage } from '../../../../components/ui/ErrorPage';
import { trpc } from '../../../../utils/trpc';
import { AppDetailsContainer } from '../../containers/AppDetailsContainer/AppDetailsContainer';

interface IProps {
  appId: string;
}

type Path = { refSlug: string; refTitle: string };
const paths: Record<string, Path> = {
  'app-store': { refSlug: 'app-store', refTitle: 'App Store' },
  apps: { refSlug: 'apps', refTitle: 'Apps' },
};

export const AppDetailsPage: NextPage<IProps> = ({ appId }) => {
  const router = useRouter();
  const t = useTranslations();

  const basePath = router.pathname.split('/').slice(1)[0];
  const { refSlug, refTitle } = paths[basePath || 'apps'] || { refSlug: 'apps', refTitle: 'Apps' };

  const { data, error } = trpc.app.getApp.useQuery({ id: appId });

  const breadcrumb = [
    { name: refTitle, href: `/${refSlug}` },
    { name: data?.info?.name || '', href: `/${refSlug}/${data?.id}`, current: true },
  ];

  // TODO: add loading state
  return (
    <Layout title={data?.info.name || ''} breadcrumbs={breadcrumb}>
      {data?.info && <AppDetailsContainer app={data} />}
      {error && <ErrorPage error={t(error.data?.tError.message as MessageKey, { ...error.data?.tError.variables })} />}
    </Layout>
  );
};
