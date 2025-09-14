import React, {createContext, useContext, useState, useEffect} from 'react';

export enum UserRole {
    CLIENT = 'CLIENT',
    TRAINER = 'TRAINER'
}

export interface AuthResponse {
    userId: number;
    email: string;
    fullName: string;
    role: UserRole;
    profileId: number;
    token: string;
}

export interface RegisterUserData {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: UserRole;
    // полета за клиенти
    dateOfBirth?: string;
    healthInformation?: string;
    fitnessGoals?: string;
    // полета за треньори
    bio?: string;
    specializations?: string[];
    personalPrice?: number;
    groupPrice?: number;
}

interface AuthContextType {
    user: AuthResponse | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<AuthResponse>;
    register: (userData: RegisterUserData) => Promise<AuthResponse>;
    logout: () => void;
    isAuthenticated: boolean;
    isClient: boolean;
    isTrainer: boolean;
    getAuthHeader: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<AuthResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Възстановяване на сесията при зареждане на страницата
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Грешка при парсване на потребителските данни:', e);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Функция за получаване на Authorization хедър
    const getAuthHeader = (): Record<string, string> => {
        return user?.token ? {Authorization: `Bearer ${user.token}`} : {};
    };

    const login = async (email: string, password: string): Promise<AuthResponse> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Грешка ${response.status}: ${response.statusText || 'Неизвестна грешка'}`);
            }

            const userData: AuthResponse = await response.json();

            // Запазваме потребителя в localStorage
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            return userData;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Възникна грешка при вход';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: RegisterUserData): Promise<AuthResponse> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Грешка ${response.status}: ${response.statusText || 'Неизвестна грешка'}`);
            }

            const registeredUser: AuthResponse = await response.json();

            // Запазваме потребителя в localStorage
            localStorage.setItem('user', JSON.stringify(registeredUser));

            setUser(registeredUser);
            return registeredUser;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        // Пренасочване към началната страница
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                isClient: user?.role === UserRole.CLIENT,
                isTrainer: user?.role === UserRole.TRAINER,
                getAuthHeader,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};