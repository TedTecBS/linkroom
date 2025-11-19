import React, { useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { userDoc, usersCollection } from '@/lib/firestore-collections';
import { User, UserRole, UserStatus } from '@/types';
import { AuthContext, type AuthContextType } from './AuthContextState';


interface AuthProviderProps {
  children: React.ReactNode;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<User | null> => {
    try {
      const userSnapshot = await getDoc(userDoc(uid));
      if (userSnapshot.exists()) {
        return userSnapshot.data();
      }
      return null;
    } catch (error: unknown) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (firebaseUser) {
      const profile = await fetchUserProfile(firebaseUser.uid);
      setUser(profile);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const profile = await fetchUserProfile(fbUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to sign in'));
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => {
    try {
      const { user: fbUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user profile in Firestore
      const newUser: Omit<User, 'id'> = {
        email,
        name,
        role,
        status: 'active' as UserStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(userDoc(fbUser.uid), newUser);

      // If job seeker, create initial profile
      if (role === 'job_seeker') {
        const profileRef = doc(usersCollection().firestore, 'job_seeker_profiles', fbUser.uid);
        await setDoc(profileRef, {
          userId: fbUser.uid,
          skills: [],
          experience: [],
          education: [],
          visibility: 'public',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Refresh to get the new user data
      await refreshUser();
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to sign up'));
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (role: UserRole) => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: fbUser } = await signInWithPopup(auth, provider);

      // Check if user exists
      const existingUser = await fetchUserProfile(fbUser.uid);

      if (!existingUser) {
        // Create new user profile
        const newUser: Omit<User, 'id'> = {
          email: fbUser.email || '',
          name: fbUser.displayName || '',
          role,
          photoURL: fbUser.photoURL || undefined,
          status: 'active' as UserStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(userDoc(fbUser.uid), newUser);

        // If job seeker, create initial profile
        if (role === 'job_seeker') {
          const profileRef = doc(usersCollection().firestore, 'job_seeker_profiles', fbUser.uid);
          await setDoc(profileRef, {
            userId: fbUser.uid,
            skills: [],
            experience: [],
            education: [],
            visibility: 'public',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      await refreshUser();
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to sign in with Google'));
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to sign out'));
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to send password reset email'));
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
