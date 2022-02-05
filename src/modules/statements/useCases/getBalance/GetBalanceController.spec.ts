import { Connection } from "typeorm";
import { v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';

import request from 'supertest';
import createConnection from "../../../../database";

import { app } from '../../../../app';

let connection: Connection;
let responseToken: request.Response;
let userId: string;

describe('Get balance controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    userId = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
        `INSERT INTO users(id, name, email, password, created_at)
          values('${userId}', 'admin', 'admin.getBalance@finapi.com.br', '${password}', 'now()')
        `
    );

    responseToken = await request(app).post("/api/v1/sessions").send({
        email: "admin.getBalance@finapi.com.br",
        password: "admin",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to retrieve user balance', async () => {
    const { token } = responseToken.body;

    const statement = {
      amount: 100,
      description: 'test create withdraw',
      type: 'deposit',
      user_id: userId,
      id: uuidV4()
    }

    await connection.query(
      `INSERT INTO statements(id, amount, description, type, user_id, created_at)
        values('${statement.id}', '${statement.amount}', '${statement.description}', '${statement.type}', '${statement.user_id}', 'now()')
      `
    );

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(100);
    expect(response.body.statement.length).toBe(1);
  })
})
