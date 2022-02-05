import { Connection } from "typeorm";
import { v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';

import request from 'supertest';
import createConnection from "../../../../database";

import { app } from '../../../../app';
import { query } from "express";

let connection: Connection;
let responseToken: request.Response;
let userId: string;

describe('Get statement operation controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    userId = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
        `INSERT INTO users(id, name, email, password, created_at)
          values('${userId}', 'admin', 'admin.getStamentOperation@finapi.com.br', '${password}', 'now()')
        `
    );

    responseToken = await request(app).post("/api/v1/sessions").send({
        email: "admin.getStamentOperation@finapi.com.br",
        password: "admin",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should not be able to retrieve a non existent statement', async () => {
    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/915b9705-7c19-4a5c-88f6-47f19466d309")
      .set({
          Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  })

  it('should be able to retrieve a statement operation', async () => {
    const statement = {
      amount: 10,
      description: 'test retrieve statement',
      type: 'deposit',
      user_id: userId,
      id:  uuidV4()
    }

    const x = await connection.query(
      `INSERT INTO statements(id, amount, description, type, user_id, created_at)
        values('${statement.id}', ${statement.amount}, '${statement.description}', '${statement.type}', '${statement.user_id}', 'now()')
      `
    );

    const { token } = responseToken.body;

    const response = await request(app)
      .get(`/api/v1/statements/${statement.id}`)
      .set({
          Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  })
})
