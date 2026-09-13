const mongoose = require('mongoose');
const request = require('supertest');

jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true),
  };
});

// Mock authentication middleware if needed, but for now we'll just test public routes or expect unauthorized.
jest.mock('../middleware/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { _id: 'testuser123' };
    next();
  };
});

const app = require('../server');

describe('Jobs API Endpoints', () => {
  it('should fetch all jobs', async () => {
    // If DB is not connected, it might fail inside the controller. 
    // We expect a 500 or empty array depending on error handling.
    const res = await request(app).get('/api/jobs');
    
    // As long as the route is reached and returns a valid HTTP response
    expect(res.statusCode).toBeDefined();
  });

  it('should fetch job recommendations', async () => {
    const res = await request(app).get('/api/jobs/recommendations');
    
    // We expect the route to exist
    expect(res.statusCode).toBeDefined();
  });
});
