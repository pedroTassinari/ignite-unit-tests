import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository
let showUserProfileUseCase: ShowUserProfileUseCase

describe('Show user profile', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()

    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory)
  })

  it('should be able to show a user profile', async () => {
    const user = await usersRepositoryInMemory.create({
      email: 'test@gmail.com',
      name: 'User test',
      password: await hash('test', 8)
    })

    const userProfile = await showUserProfileUseCase.execute(user.id as string)

    expect(userProfile).toEqual(user)
  })


  it('should not be able to show a non existent user profile', () => {
    expect(async () => {
      await showUserProfileUseCase.execute('userId')
    }).rejects.toBeInstanceOf(AppError)
  })
})
