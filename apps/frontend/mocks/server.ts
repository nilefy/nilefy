import { setupServer } from 'msw/node';
import { handlers } from './mock';

export const server = setupServer(...handlers);
