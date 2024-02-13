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

it('ws test', async () => {
  const client1 = new WebSocket('ws://localhost:3000');
  await ws.connected;
  const client2 = new WebSocket('ws://localhost:3000');
  await ws.connected;

  const messages: {
    client1: string[],
    client2: string[],
  } = {
    client1: [],
    client2: []
  };
  client1.onmessage = (e: MessageEvent<string>) => {
    messages.client1.push(e.data);
  };
  client2.onmessage = (e) => {
    messages.client2.push(e.data);
  };

  ws.send('hello everyone');
  expect(messages).toEqual({
    client1: ['hello everyone'],
    client2: ['hello everyone'],
  });
});
