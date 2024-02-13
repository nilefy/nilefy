import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react';
import { server } from '../mocks/server'
import '@testing-library/jest-dom/vitest'

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers();
  cleanup();
})
afterAll(() => server.close())

server.events.on('request:start', ({ request }) => {
  console.log('MSW intercepted:', request.method, request.url)
})
