import { Connection } from "typeorm";
import { v4 as uuidV4 } from 'uuid';
import { hash } from 'bcryptjs';

import request from 'supertest';
import createConnection from "../../../../database";

import { app } from '../../../../app';

let connection: Connection;

describe('Create user controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should not be able to create an user with previous registered email', async () => {
    const userId = uuidV4();
    const password = await hash("admin", 8);
    const email = 'admin.createUser@finapi.com.br'

    await connection.query(
        `INSERT INTO users(id, name, email, password, created_at)
          values('${userId}', 'admin', '${email}' , '${password}', 'now()')
        `
    );

    const response = await request(app)
      .post("/api/v1/users")
      .send({
        email,
        password: "admin123",
        name: 'administrator'
      })

    expect(response.status).toBe(400);
  })

  it('should be able to create an user', async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        email: "admin.createUserTest@finapi.com.br",
        password: "admin123",
        name: 'administrator'
      })

    expect(response.status).toBe(201);
  })
})
