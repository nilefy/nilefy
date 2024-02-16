import React from 'react';
import userEvent from '@testing-library/user-event';
import { it, expect } from 'vitest';
import { act, fireEvent, getByText, logRoles, render, screen, waitFor, within } from '@testing-library/react';
import { Editor } from '../src/Pages/Editor/Editor';
import { RouterProvider, createMemoryRouter, BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// TODO: create custom render

it('dnd', async () => {
  const routes = [
    {
      path: '/',
      element: <Editor />,
      loader: () => ({ app: '' }),
    },
  ];
  const router = createMemoryRouter(routes, { initialEntries: ['/'], initialIndex: 0 });

  const { container } = render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );

  /**
   * works
   */
  expect(container.querySelector('[data-testid="Button"]')).toBeDefined();

  /**
   * doesn't work??
  */
  expect(screen.getByTestId('Button')).toBeDefined();


  /**
   * dnd simulation
   */
  // const dragged = screen.getByTestId('Button');
  // const droppable = screen.getByTestId('0');

  // fireEvent.dragStart(dragged);
  // fireEvent.dragOver(droppable);
  // fireEvent.dragEnd(droppable);

  // screen.getByRole('button', { name: 'Button' }).focus();
  // screen.getByLabelText('Text').textContent = 'tested button';

  // expect(screen.getByText('tested button')).toBeDefined();
})
