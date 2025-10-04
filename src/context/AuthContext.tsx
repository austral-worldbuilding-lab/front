import { createContext, useContext, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { User as BackendUser } from '@/services/userService';

interface AuthContextType {
    user: FirebaseUser | null;
    backendUser: BackendUser | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, fullName: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isAuth: () => boolean;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}; 