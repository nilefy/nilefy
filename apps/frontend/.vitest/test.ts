/**
 * @vitest-environment node
 */

import { it, expect } from 'vitest'

it('test', () => {
  expect(1 + 1).toBe(2);
})

it('request test', async () => {
  const response = await fetch('http://localhost:3000/auth/signup', {
    method: 'POST'
  });
  expect(response.status).toBe(201)
})
