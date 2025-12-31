import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../../../firebase';

export function useAuthState() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    console.log('[useAuthState] subscribing to auth state');
    const unsub = onAuthStateChanged(auth, u => {
      console.log('[useAuthState] auth changed, user=', u);
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);
  return { user, loading };
}