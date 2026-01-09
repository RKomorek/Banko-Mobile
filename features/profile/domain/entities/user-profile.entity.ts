export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  surname: string;
  displayName?: string;
  photoURL?: string | null;
}
