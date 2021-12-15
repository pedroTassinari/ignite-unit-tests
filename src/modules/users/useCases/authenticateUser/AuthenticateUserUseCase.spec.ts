import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase

describe('Authenticate user', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()

    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory)
  })

  it('should be able to authenticate an user', async () => {
    const user = await usersRepositoryInMemory.create({
      email: 'test@gmail.com',
      name: 'User test',
      password: await hash('test', 8)
    })

    const authentication = await authenticateUserUseCase.execute({
      email: 'test@gmail.com',
      password: 'test'
    })

    expect(authentication).toHaveProperty('token')
    expect(authentication.user.email).toBe(user.email)
    expect(authentication.user.id).toBe(user.id)
  })

  it('should not be able to authenticate a non existent user', () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'test@gmail.com',
        password: 'test'
      })
    }).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to authenticate a user sending wrong password', () => {
    expect(async () => {
      await usersRepositoryInMemory.create({
        email: 'test@gmail.com',
        name: 'User test',
        password: await hash('test', 8)
      })

      await authenticateUserUseCase.execute({
        email: 'test@gmail.com',
        password: 'wrongPassword'
      })
    }).rejects.toBeInstanceOf(AppError)
  })
})
