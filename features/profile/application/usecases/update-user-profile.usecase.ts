import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';

export class UpdateUserProfileUseCase {
  constructor(private repository: IUserProfileRepository) {}

  async execute(uid: string, data: any): Promise<void> {
    return await this.repository.updateUserProfile(uid, data);
  }
}
