const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

let mongoServer;
let token;
let workspaceId;
let taskId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Setup user and workspace
  const authRes = await request(app).post('/api/auth/register').send({
    name: 'Tester',
    email: 'test@taskflow.dev',
    password: 'password123',
  });
  token = authRes.body.token;

  const wsRes = await request(app)
    .post('/api/workspaces')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Space' });
  workspaceId = wsRes.body.workspace._id;

  const taskRes = await request(app)
    .post(`/api/workspaces/${workspaceId}/tasks`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Root Task' });
  taskId = taskRes.body.task._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Enterprise Features - Subtasks & Comments', () => {
  it('should add a subtask', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/tasks/${taskId}/subtasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Subtask 1' });
    
    expect(res.status).toBe(201);
    expect(res.body.task.subtasks).toHaveLength(1);
    expect(res.body.task.subtasks[0]).toHaveProperty('title', 'Subtask 1');
  });

  it('should add a comment', async () => {
    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Hello World' });
    
    expect(res.status).toBe(201);
    expect(res.body.comment).toHaveProperty('text', 'Hello World');
    expect(res.body.comment).toHaveProperty('author');
  });

  it('should list comments', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.comments).toBeInstanceOf(Array);
    expect(res.body.comments.length).toBeGreaterThan(0);
  });
});
