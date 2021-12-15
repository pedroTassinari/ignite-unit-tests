import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Create user', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
  })

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      email: 'test@gmail.com',
      name: 'User test',
      password: 'test'
    })

    expect(user).toHaveProperty('id')
  })


  it('should not be able to create an user with the same email', () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: 'test@gmail.com',
        name: 'User test',
        password: 'test'
      })

      await createUserUseCase.execute({
        email: 'test@gmail.com',
        name: 'User test 2',
        password: 'test2'
      })
    }).rejects.toBeInstanceOf(AppError)
  })
})
