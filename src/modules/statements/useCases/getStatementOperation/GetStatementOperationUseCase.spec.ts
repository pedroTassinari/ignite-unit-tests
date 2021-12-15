import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository
let statementsRepositoryInMemory: InMemoryStatementsRepository
let getStatementOperationUseCase: GetStatementOperationUseCase

describe('Get statement operation use case', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    statementsRepositoryInMemory = new InMemoryStatementsRepository()

    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
  })

  it('should be able to retrieve a statement', async () => {
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

    const retrievedStatement = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    })

    expect(retrievedStatement).toEqual(statement)
  })

  it('should not be able to retrieve a statement with a non existent user', () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'userId',
        statement_id: 'statementId'
      })
    }).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to retrieve a non existent statement', () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        email: 'test@gmail.com',
        name: 'User test',
        password: await hash('test', 8)
      })

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: 'statementId'
      })
    }).rejects.toBeInstanceOf(AppError)
  })
})
