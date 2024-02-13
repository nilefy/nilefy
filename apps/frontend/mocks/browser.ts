import { setupWorker } from 'msw/browser';
import { handlers } from './mock';

export const startWorker = () => {
  const worker = setupWorker(...handlers);
  worker.start();
};
