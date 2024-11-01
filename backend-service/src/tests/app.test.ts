import { test, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

// /health tests

test('Health check', async () => {
  const response = await request(app).get('/health');
  expect(response.status).toBe(200);
  expect(response.text).toBe('OK');
});

test('POST to GET-only route', async () => {
  const response = await request(app).post('/health');
  expect(response.status).toBe(404); 
  expect(response.text).toContain('Cannot POST /health');
});

test('Bad endpoint', async () => {
  const response = await request(app).get('/bad-endpoint');
  expect(response.status).toBe(404);
  expect(response.text).toContain('Cannot GET /bad-endpoint');
});

// /cities tests
test('GET /cities returns 5 cities', async () => {
  const response = await request(app).get('/cities');
  console.log(response.body);
  expect(response.status).toBe(200);
  expect(response.body).toHaveLength(5);
});
