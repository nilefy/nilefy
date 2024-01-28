import { setupServer } from 'msw/node';
import { handlers } from './handlers';
// the reason we're using msw/node is because we're running this in vitest which is basically node
export const server = setupServer(...handlers);

// Maybe if we do e2e testing we can use msw/browser
