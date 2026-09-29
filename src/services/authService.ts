import { signInWithEmailAndPassword } from 'firebase/auth';

import { identityApiClient } from '@/lib/apiClient';
import { auth } from '@/lib/firebase/config';
import { setFirebaseToken } from '@/lib/utils';

export const getRefreshedFirebaseIdToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated Firebase user');
  }

  const token = await user.getIdToken(true);
  setFirebaseToken(token);
  return token;
};

export const validateLogin = async () => {
  const token = await getRefreshedFirebaseIdToken();
  const response = await identityApiClient.get('/auth/validate-login', {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 20000,
    skipSessionExpiryHandler: true,
  });
  return response.data;
};

export const validateCookies = async () => {
  const response = await identityApiClient.get('/auth/validate-cookies', {
    skipSessionExpiryHandler: true,
  });
  return response.data;
};

export const logOut = async () => {
  const response = await identityApiClient.post(
    '/auth/logout',
    {},
    { skipSessionExpiryHandler: true },
  );
  return response;
};

export const authenticateWithFirebase = async (
  email: string,
  password: string,
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const token = await userCredential.user.getIdToken();

    // Store Firebase token using utility function
    setFirebaseToken(token);

    return {
      user: userCredential.user,
      token,
    };
  } catch (error) {
    throw new Error(
      `Firebase authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};
