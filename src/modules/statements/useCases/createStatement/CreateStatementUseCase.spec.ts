import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository
let statementsRepositoryInMemory: InMemoryStatementsRepository
let createStatementUseCase: CreateStatementUseCase

describe('Create statement', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    statementsRepositoryInMemory = new InMemoryStatementsRepository()

    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
  })

  it('should be able to create a new statement', async () => {
    const user = await usersRepositoryInMemory.create({
      email: 'test@gmail.com',
      name: 'User test',
      password: await hash('test', 8)
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      description: 'Description test',
      amount: 400,
      type: OperationType.DEPOSIT
    })

    expect(statement).toHaveProperty('id')
  })

  it('should not be able to create a new statement using a non existent user', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: '123',
        description: 'Description test',
        amount: 400,
        type: OperationType.DEPOSIT
      })
    }).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to create a new withdraw statement when user does not have enough balance', () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        email: 'test@gmail.com',
        name: 'User test',
        password: await hash('test', 8)
      })

      await createStatementUseCase.execute({
        user_id: user.id as string,
        description: 'Description test',
        amount: 400,
        type: OperationType.WITHDRAW
      })
    }).rejects.toBeInstanceOf(AppError)
  })

  it('should be able to create a new withdraw statement when have enough balance', async () => {
    const user = await usersRepositoryInMemory.create({
      email: 'test@gmail.com',
      name: 'User test',
      password: await hash('test', 8)
    })

    await createStatementUseCase.execute({
      user_id: user.id as string,
      description: 'Description test',
      amount: 400,
      type: OperationType.DEPOSIT
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      description: 'Description test',
      amount: 400,
      type: OperationType.WITHDRAW
    })

    expect(statement).toHaveProperty('id')
  })
})
