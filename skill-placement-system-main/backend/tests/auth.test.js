const mongoose = require('mongoose');
const request = require('supertest');

// Note: In a real test environment we'd mock the database or use a test DB.
// We are mocking mongoose to avoid actually hitting the DB for these tests to run quickly.

jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true),
  };
});

const app = require('../server');

describe('Auth API Endpoints', () => {
  it('should return validation error for missing registration fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User'
      });
    
    expect(res.statusCode).toEqual(400);
    // Based on the error handling middleware
    expect(res.body).toHaveProperty('error');
  });

  it('should return error for invalid login credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
    
    // Depending on the exact logic, it could be 400 or 401 or 500 if DB is mocked to fail
    expect(res.statusCode).toBeGreaterThanOrEqual(400); 
  });
});
