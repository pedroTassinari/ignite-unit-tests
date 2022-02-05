import { Connection } from "typeorm";
import { v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';

import request from 'supertest';
import createConnection from "../../../../database";

import { app } from '../../../../app';

let connection: Connection;
let responseToken: request.Response;
let userId: string;

describe('Create statement controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    userId = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
        `INSERT INTO users(id, name, email, password, created_at)
          values('${userId}', 'admin', 'admin.createStatement@finapi.com.br', '${password}', 'now()')
        `
    );

    responseToken = await request(app).post("/api/v1/sessions").send({
        email: "admin.createStatement@finapi.com.br",
        password: "admin",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to create a new deposit statement', async () => {
    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
          amount: 50,
          description: "Deposit test",
      })
      .set({
          Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  })

  it('should be able to create a new withdraw statement', async () => {
    const statement = {
      amount: 10,
      description: 'test create withdraw',
      type: 'deposit',
      user_id: userId,
      id: uuidV4()
    }

    await connection.query(
      `INSERT INTO statements(id, amount, description, type, user_id, created_at)
        values('${statement.id}', ${statement.amount}, '${statement.description}', '${statement.type}', '${statement.user_id}', 'now()')
      `
    );

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
          amount: 10,
          description: "Withdraw test",
      })
      .set({
          Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  })

  it('should not be able to create a new withdraw statement when user does not have enough balance', async () => {
    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
          amount: 1000,
          description: "Withdraw test",
      })
      .set({
          Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  })
})
