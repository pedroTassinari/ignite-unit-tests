import { Connection } from "typeorm";
import { v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';

import request from 'supertest';
import createConnection from "../../../../database";

import { app } from '../../../../app';

let connection: Connection;

describe('Authenticate user controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const userId = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
        `INSERT INTO users(id, name, email, password, created_at)
          values('${userId}', 'admin', 'admin.authenticateUser@finapi.com.br', '${password}', 'now()')
        `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to authenticate an user with correct credentials', async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin.authenticateUser@finapi.com.br",
        password: "admin",
      })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  })

  it('should not be able to authenticate an user using wrong credentials', async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin.authenticateUser@finapi.com.br",
        password: "wrongPassword",
      })

    expect(response.status).toBe(401);
  })
})
