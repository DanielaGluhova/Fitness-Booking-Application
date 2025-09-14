
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ClientLayoutProps {
    children: ReactNode;
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Хедър */}
            <header className="bg-white text-black shadow-md border-b border-gray-200">
                <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-black">FitBook</span>
                            <span className="ml-1 text-sm text-gray-600">Клиент</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-black">Здравейте, {user?.fullName}!</span>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-black rounded-md text-sm hover:bg-gray-100 transition-colors"
                            >
                                Изход
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Навигация */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-6">
                        <Link
                            to="/client/bookings"
                            className={`py-4 px-2 border-b-2 transition-colors ${isActive('/client/bookings')
                                ? 'border-blue-600 text-blue-600 font-semibold'
                                : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'}`}
                        >
                            Моите резервации
                        </Link>
                        <Link
                            to="/client/book"
                            className={`py-4 px-2 border-b-2 transition-colors ${isActive('/client/book')
                                ? 'border-blue-600 text-blue-600 font-semibold'
                                : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'}`}
                        >
                            Резервирай час
                        </Link>
                        <Link
                            to="/client/profile"
                            className={`py-4 px-2 border-b-2 transition-colors ${isActive('/client/profile')
                                ? 'border-blue-600 text-blue-600 font-semibold'
                                : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'}`}
                        >
                            Профил
                        </Link>
                    </nav>
                </div>
            </div>

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