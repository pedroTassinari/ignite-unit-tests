import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository
let statementsRepositoryInMemory: InMemoryStatementsRepository
let getBalanceUseCase: GetBalanceUseCase

describe('Create statement use case', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    statementsRepositoryInMemory = new InMemoryStatementsRepository()

    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory)
  })

  it('should be able to get a user balance', async () => {
    const user = await usersRepositoryInMemory.create({
      email: 'test@gmail.com',
      name: 'User test',
      password: await hash('test', 8)
    })

    const statement = await statementsRepositoryInMemory.create({
      amount: 300,
      description: 'Testing',
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    })

    const userBalance = await getBalanceUseCase.execute({ user_id: user.id as string })

    expect(userBalance.balance).toBe(300)
    expect(userBalance.statement.length).toBe(1)
    expect(userBalance.statement[0]).toEqual(statement)
  })

  it('should not be able to get a non existent user balance', () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: '1234' })
    }).rejects.toBeInstanceOf(AppError)
  })
})
