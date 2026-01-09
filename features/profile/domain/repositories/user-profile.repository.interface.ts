import { UserProfile } from '../entities/user-profile.entity';

export interface IUserProfileRepository {
  getUserProfile(uid: string): Promise<UserProfile | null>;
  updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void>;
}
