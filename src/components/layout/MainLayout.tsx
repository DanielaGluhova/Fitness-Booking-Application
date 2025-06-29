import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Хедър */}
            <header className="bg-white text-black shadow-md border-b border-gray-200">
                <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="text-xl font-bold text-black">
                            FitBook
                        </Link>

                        <nav className="flex space-x-4">
                            {!isAuthenticated ? (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                                    >
                                        Вход
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Регистрация
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {user?.role === 'TRAINER' ? (
                                        <Link
                                            to="/trainer/dashboard"
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            Треньорски панел
                                        </Link>
                                    ) : (
                                        <Link
                                            to="/client/bookings"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Моите тренировки
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Изход
                                    </button>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Основно съдържание */}
            <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-white">
                {children}
            </main>

            {/* Футър */}
            <footer className="bg-white text-black py-6 border-t border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="text-sm text-black">
                                &copy; {new Date().getFullYear()} FitBook. Всички права запазени.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};