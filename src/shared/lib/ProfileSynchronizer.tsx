'use client';

import { useEffect } from 'react';
import { useMe } from '@/features/user/api/userApi';
import { useAuthStore } from '@/features/auth';
import { mapUser } from "@/shared/lib/mapUser";

/**
 * ProfileSynchronizer component
 * Calls /me API when authenticated to ensure the token is valid 
 * and profile data is fresh.
 */
export function ProfileSynchronizer() {
  const { isAuthenticated, setCredentials, accessToken, user } = useAuthStore();
  const { data, isError } = useMe();

  useEffect(() => {
    if (isAuthenticated && data) {
      const freshUser = mapUser(data);
      
      // Refresh user data in store if needed
      if (freshUser.username !== user?.username || freshUser.role !== user?.role) {
        setCredentials(accessToken!, freshUser);
      }
    }
  }, [data, isAuthenticated, setCredentials, accessToken, user]);

  return null;
}
