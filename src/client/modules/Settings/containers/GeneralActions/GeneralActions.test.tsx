import React from 'react';
import { getTRPCMock, getTRPCMockError } from '@/client/mocks/getTrpcMock';
import { server } from '@/client/mocks/server';
import { StatusProvider } from '@/components/hoc/StatusProvider';
import { renderHook } from '@testing-library/react';
import { useSystemStore } from '@/client/state/systemStore';
import { GeneralActions } from './GeneralActions';
import { fireEvent, render, screen, waitFor } from '../../../../../../tests/test-utils';

describe('Test: GeneralActions', () => {
  it('should render without error', () => {
    render(<GeneralActions />);

    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should show toast if update mutation fails', async () => {
    // arrange
    server.use(getTRPCMock({ path: ['system', 'getVersion'], response: { current: '1.0.0', latest: '2.0.0', body: '' } }));
    server.use(getTRPCMockError({ path: ['system', 'update'], type: 'mutation', status: 500, message: 'Something went wrong' }));
    render(<GeneralActions />);
    await waitFor(() => {
      expect(screen.getByText('Update to 2.0.0')).toBeInTheDocument();
    });
    const updateButton = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(updateButton);

    // act
    const updateButtonModal = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(updateButtonModal);

    // assert
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });
  });

  it('should set poll status to true if update mutation succeeds', async () => {
    // arrange
    server.use(getTRPCMock({ path: ['system', 'getVersion'], response: { current: '1.0.0', latest: '2.0.0', body: '' } }));
    server.use(getTRPCMock({ path: ['system', 'update'], type: 'mutation', response: true }));
    const { result } = renderHook(() => useSystemStore());
    result.current.setStatus('RUNNING');

    render(
      <StatusProvider>
        <GeneralActions />
      </StatusProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText('Update to 2.0.0')).toBeInTheDocument();
    });
    const updateButton = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(updateButton);

    // act
    const updateButtonModal = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(updateButtonModal);

    result.current.setStatus('UPDATING');

    // assert
    await waitFor(() => {
      expect(screen.getByText('Your system is updating...')).toBeInTheDocument();
    });
    expect(result.current.pollStatus).toBe(true);
  });

  it('should show toast if restart mutation fails', async () => {
    // arrange
    server.use(getTRPCMockError({ path: ['system', 'restart'], type: 'mutation', status: 500, message: 'Something went badly' }));
    render(<GeneralActions />);
    const restartButton = screen.getByRole('button', { name: /Restart/i });

    // act
    fireEvent.click(restartButton);
    const restartButtonModal = screen.getByRole('button', { name: /Restart/i });
    fireEvent.click(restartButtonModal);

    // assert
    await waitFor(() => {
      expect(screen.getByText(/Something went badly/)).toBeInTheDocument();
    });
  });

  it('should set poll status to true if restart mutation succeeds', async () => {
    // arrange
    server.use(getTRPCMock({ path: ['system', 'restart'], type: 'mutation', response: true }));
    const { result } = renderHook(() => useSystemStore());
    result.current.setStatus('RUNNING');

    render(
      <StatusProvider>
        <GeneralActions />
      </StatusProvider>,
    );

    const restartButton = screen.getByRole('button', { name: /Restart/i });

    // act
    fireEvent.click(restartButton);
    const restartButtonModal = screen.getByRole('button', { name: /Restart/i });
    fireEvent.click(restartButtonModal);

    result.current.setStatus('RESTARTING');

    // assert
    await waitFor(() => {
      expect(screen.getByText('Your system is restarting...')).toBeInTheDocument();
    });
    expect(result.current.pollStatus).toBe(true);
  });
});
