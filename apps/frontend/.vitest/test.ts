import { it, expect } from 'vitest';
import { ws } from '../mocks/ws';

it('test', () => {
  expect(1 + 1).toBe(2);
})

it('request test', async () => {
  const response = await fetch('http://localhost:3000/auth/signup', {
    method: 'POST'
  });
  expect(response.status).toBe(201)
})

it('ws test', () => {
  ws.on('connection', (socket) => {
    socket.on('message', (data) => {
      expect(data).toBe('test message from app');
      socket.send('test message from mock server');
    });
  });

  try {
    const app =  new WebSocket('ws://localhost:3000');
    app.send('test message from app');
    app.onmessage = (ev: MessageEvent<string>) => {
      expect(ev.data).toBe('test message from mock server');
    };
  }
  catch {}

  expect(ws.clients().length).toBe(1);
});
