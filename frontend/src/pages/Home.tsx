import { Link } from 'react-router-dom';
import {useAuth, UserRole} from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';

const Home = () => {
    const { isAuthenticated, user } = useAuth();

    // Функция за редирект според ролята на потребителя
    const getStartedLink = () => {
        if (!isAuthenticated) {
            return '/register';
        }

        if (user?.role === UserRole.TRAINER) {
            return '/trainer/dashboard';
        } else {
            return '/client/bookings';
        }
    };

    return (
        <MainLayout>
            <div className="container mx-auto px-4">
                {/* Герой секция */}
                <section className="flex flex-col-reverse lg:flex-row items-center py-12 lg:py-20">
                    <div className="lg:w-1/2 lg:pr-12 mt-8 lg:mt-0">
                        <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4">
                            Вашият фитнес график в едно приложение
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Резервирайте часове за тренировка и следете графика си - всичко на едно място.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link
                                to={getStartedLink()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-center transition-colors"
                            >
                                {isAuthenticated ? 'Към приложението' : 'Започнете сега'}
                            </Link>
                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg text-center transition-colors"
                                >
                                    Вход
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <img
                            src="/public/hero-image.jpg"
                            alt="Фитнес тренировка"
                            className="rounded-lg shadow-xl"
                            style={{ maxHeight: '500px', objectFit: 'cover' }}
                        />
                    </div>
                </section>


                {/* За треньори */}
                <section className="py-12 lg:py-20 bg-gray-50 rounded-lg">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row items-center">
                            <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-12">
                                <h2 className="text-3xl font-bold text-black mb-4">
                                    За треньори
                                </h2>
                                <p className="text-xl text-gray-600 mb-6">
                                    Управлявайте своя график, клиенти и тренировки по-ефективно.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-black">Лесно управление на календара</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-black">Проследяване на резервациите</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="lg:w-1/2">
                                <img
                                    src="/public/trainer.jpg"
                                    alt="Фитнес треньор"
                                    className="rounded-lg shadow-xl"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* За клиенти */}
                <section className="py-12 lg:py-20 bg-gray-50 rounded-lg">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row items-center">
                            <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-12">
                                <h2 className="text-3xl font-bold text-black mb-4">
                                    За клиенти
                                </h2>
                                <p className="text-xl text-gray-600 mb-6">
                                    Лесно и удобно.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-black">Преглед на календара</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-black">Неограничени резервации</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-black">Проследяване на тренировки</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="lg:w-1/2">
                                <img
                                    src="/public/client.jpg"
                                    alt="Клиент във Фитнес"
                                    className="rounded-lg shadow-xl"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA секция */}
                <section className="py-12 lg:py-20 bg-gray-800 rounded-lg text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Готови ли сте да започнете?
                    </h2>
                    <p className="text-xl mb-8 max-w-xl mx-auto">
                        Присъединете се към хилядите потребители, които вече оптимизираха своите фитнес тренировки.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link
                            to="/register"
                            className="bg-white text-gray-800 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors"
                        >
                            Регистрирайте се
                        </Link>
                        <Link
                            to="/login"
                            className="border border-white text-white hover:bg-gray-700 font-bold py-3 px-8 rounded-lg transition-colors"
                        >
                            Вход
                        </Link>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
};

export default Home;