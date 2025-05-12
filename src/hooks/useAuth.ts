import { useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await setPersistence(auth, browserLocalPersistence);
            const result = await signInWithEmailAndPassword(auth, email, password);
            setUser(result.user);
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (
        email: string,
        password: string,
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            setUser(result.user);
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signOut(auth);
            setUser(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const isAuth = (): boolean => {
        return !!user;
    };

    return {
        login,
        register,
        logout,
        isAuth,
        isLoading,
        error,
        user,
    };
};
