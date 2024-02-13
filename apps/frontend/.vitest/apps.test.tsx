import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect } from 'vitest';
import { CreateAppDialog } from '../src/Pages/apps/apps';
import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

it('create app', async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CreateAppDialog />
    </QueryClientProvider>
  );

  await userEvent.click(screen.getByText('create new app'));
  screen.getByPlaceholderText('App name').textContent = 'created app name';
  await userEvent.click(screen.getByRole('button', { name: 'Create App' }));

  const res = await fetch(`http://localhost:3000/workspaces/1/apps`, {
    method: 'POST',
  });

  expect(screen.getByText('created app name')).toBeDefined();
})
