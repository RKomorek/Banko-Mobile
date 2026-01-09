import { UserProfile } from '../../domain/entities/user-profile.entity';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';

export class GetUserProfileUseCase {
  constructor(private repository: IUserProfileRepository) {}

  async execute(uid: string): Promise<UserProfile | null> {
    return await this.repository.getUserProfile(uid);
  }
}
