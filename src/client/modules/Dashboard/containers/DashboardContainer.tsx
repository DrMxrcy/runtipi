import { IconCircuitResistor, IconCpu, IconDatabase } from '@tabler/icons-react';
import React from 'react';
import { useTranslations } from 'next-intl';
import { SystemRouterOutput } from '../../../../server/routers/system/system.router';
import SystemStat from '../components/SystemStat';

type IProps = { data?: SystemRouterOutput['systemInfo']; isLoading: boolean };

const defaultData: SystemRouterOutput['systemInfo'] = {
  cpu: { load: 0 },
  disk: { available: 0, total: 0, used: 0 },
  memory: { available: 0, total: 0, used: 0 },
};

export const DashboardContainer: React.FC<IProps> = ({ data = defaultData, isLoading }) => {
  const { disk, memory, cpu } = data;
  const t = useTranslations('dashboard');
  // Convert bytes to GB
  const diskFree = Math.round(disk.available / 1024 / 1024 / 1024);
  const diskSize = Math.round(disk.total / 1024 / 1024 / 1024);
  const diskUsed = diskSize - diskFree;
  const percentUsed = Math.round((diskUsed / diskSize) * 100);

  const memoryTotal = Math.round(Number(memory.total) / 1024 / 1024 / 1024);
  const memoryFree = Math.round(Number(memory.available) / 1024 / 1024 / 1024);
  const percentUsedMemory = Math.round(((memoryTotal - memoryFree) / memoryTotal) * 100);

  return (
    <div className="row row-deck row-cards">
      <SystemStat isLoading={isLoading} title={t('cards.disk.title')} metric={`${diskUsed} GB`} subtitle={t('cards.disk.subtitle', { total: diskSize })} icon={IconDatabase} progress={percentUsed} />
      <SystemStat isLoading={isLoading} title={t('cards.cpu.title')} metric={`${cpu.load.toFixed(2)}%`} subtitle={t('cards.cpu.subtitle')} icon={IconCpu} progress={cpu.load} />
      <SystemStat isLoading={isLoading} title={t('cards.memory.title')} metric={`${percentUsedMemory || 0}%`} subtitle={`${memoryTotal} GB`} icon={IconCircuitResistor} progress={percentUsedMemory} />
    </div>
  );
};
