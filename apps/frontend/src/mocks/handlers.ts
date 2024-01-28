import { http, HttpResponse } from 'msw';

export const handlers = [
  // example api call
  // TODO: This is just a placeholder, the entire file will be auto generated from api spec file
  http.get('/api/user', () => {
    return HttpResponse.json({
      username: 'admin',
    });
  }),
];
