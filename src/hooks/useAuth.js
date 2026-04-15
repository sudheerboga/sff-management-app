import { useState, useEffect } from 'react';
import { onAuthChange } from '../firebase/authService';

export function useAuth() {
  const [user,setUser]     = useState(null);
  const [loading,setLoading] = useState(true);
  useEffect(() => {
    const unsub = onAuthChange(u => { setUser(u??false); setLoading(false); });
    return unsub;
  }, []);
  return { user, loading };
}
