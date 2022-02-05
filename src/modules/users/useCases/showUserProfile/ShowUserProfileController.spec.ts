import { Connection } from "typeorm";
import { v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';

import request from 'supertest';
import createConnection from "../../../../database";

import { app } from '../../../../app';

let connection: Connection;

describe('Show user profile controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to show user profile', async () => {
    const userId = uuidV4();
    const password = await hash("admin", 8);
    const email = 'admin.showUserProfile@finapi.com.br';

    await connection.query(
        `INSERT INTO users(id, name, email, password, created_at)
          values('${userId}', 'admin', '${email}' , '${password}', 'now()')
        `
    );

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin.showUserProfile@finapi.com.br",
        password: "admin",
      });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  })
})
