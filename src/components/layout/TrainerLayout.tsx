// src/components/layout/TrainerLayout.tsx
import { ReactNode, useState, useEffect } from 'react';
import {useNavigate, NavLink} from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface TrainerLayoutProps {
    children: ReactNode;
}

export const TrainerLayout = ({ children }: TrainerLayoutProps) => {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Проверка дали потребителят е удостоверен и пренасочване, ако не е
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Навигационна лента */}
            <header className="bg-white shadow border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-black">FitBook</span>
                                <span className="ml-1 text-sm text-gray-600">Треньор</span>
                            </div>
                            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <NavLink
                                    to="/trainer/dashboard"
                                    className={({ isActive }) =>
                                        `${isActive ? 'border-black text-black' : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-black'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                                    }
                                >
                                    Табло
                                </NavLink>
                                <NavLink
                                    to="/trainer/schedule"
                                    className={({ isActive }) =>
                                        `${isActive ? 'border-black text-black' : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-black'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                                    }
                                >
                                    График
                                </NavLink>
                                <NavLink
                                    to="/trainer/profile"
                                    className={({ isActive }) =>
                                        `${isActive ? 'border-black text-black' : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-black'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                                    }
                                >
                                    Профил
                                </NavLink>
                            </nav>
                        </div>

                        {/* Мобилно меню бутон */}
                        <div className="sm:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100 focus:outline-none transition-colors"
                            >
                                <span className="sr-only">Отвори меню</span>
                                <svg
                                    className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <svg
                                    className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Бутон за излизане и потребителско меню */}
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-black rounded-md text-sm hover:bg-gray-100 transition-colors"
                            >
                                Изход
                            </button>
                        </div>
                    </div>
                </div>

                {/* Мобилно меню */}
                <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
                    <div className="pt-2 pb-3 space-y-1">
                        <NavLink
                            to="/trainer/dashboard"
                            className={({ isActive }) =>
                                `${isActive ? 'bg-gray-100 border-black text-black' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-black'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`
                            }
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Табло
                        </NavLink>
                        <NavLink
                            to="/trainer/schedule"
                            className={({ isActive }) =>
                                `${isActive ? 'bg-gray-100 border-black text-black' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-black'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`
                            }
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            График
                        </NavLink>
                        <NavLink
                            to="/trainer/profile"
                            className={({ isActive }) =>
                                `${isActive ? 'bg-gray-100 border-black text-black' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-black'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`
                            }
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Профил
                        </NavLink>
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMobileMenuOpen(false);
                            }}
                            className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-black transition-colors"
                        >
                            Изход
                        </button>
                    </div>
                </div>
            </header>

            {/* Основно съдържание */}
            <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-white">
                {children}
            </main>

            {/* Долна лента с авторски права и информация */}
            <footer className="bg-white shadow border-t border-gray-200">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-black text-sm">
                        &copy; {new Date().getFullYear()} FitApp - Всички права запазени
                    </p>
                </div>
            </footer>
        </div>
    );
};