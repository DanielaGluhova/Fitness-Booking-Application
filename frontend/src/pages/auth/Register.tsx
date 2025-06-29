
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {useAuth, UserRole} from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Валидационна схема
const registerSchema = z.object({
    email: z.string().email('Моля, въведете валиден имейл'),
    password: z.string().min(6, 'Паролата трябва да бъде поне 6 символа'),
    confirmPassword: z.string().min(6, 'Моля, потвърдете паролата'),
    fullName: z.string().min(5, 'Името трябва да бъде поне 5 символа'),
    phone: z.string()
        .regex(/^[+]?[0-9\s\-()]{10,14}$/, 'Моля, въведете телефонния си номер в следния формат "0123456789" или "+359123456789"'),
    role: z.enum([UserRole.CLIENT, UserRole.TRAINER]),
    // Допълнителни полета за клиенти
    dateOfBirth: z.string().optional().refine((date) => {
        if (!date) return true;
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 16 && age <= 100;
    }, 'Трябва да сте на възраст между 16 и 100 години'),
    healthInformation: z.string().max(1000, 'Максимум 1000 символа').optional(),
    fitnessGoals: z.string().max(1000, 'Максимум 1000 символа').optional(),
    // Допълнителни полета за треньори
    bio: z.string().max(2000, 'Максимум 2000 символа').optional(),
    specializations: z.array(z.string()).optional(),
    personalPrice: z.number()
        .min(0.01, 'Цената трябва да бъде положителна')
        .max(1000, 'Максималната цена е 1000 лв')
        .optional(),
    groupPrice: z.number()
        .min(0.01, 'Цената трябва да бъде положителна')
        .max(500, 'Максималната цена е 500 лв')
        .optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Паролите не съвпадат",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: UserRole.CLIENT,
            specializations: [],
        }
    });

    const watchRole = watch('role');

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...registerData } = data;

        try {
            await registerUser(registerData);

            // Проверка на ролята и съответно пренасочване
            if (data.role === UserRole.TRAINER) {
                navigate('/trainer/dashboard');
            } else if (data.role === UserRole.CLIENT) {
                navigate('/client/dashboard');
            } else {
                navigate('/dashboard'); // fallback
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Възникна грешка при регистрация');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
                        Регистрация на нов акаунт
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        или{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                            влезте с вашия акаунт
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-black">
                                Име и фамилия
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                {...register('fullName')}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                                placeholder="Име и фамилия"
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-black">
                                Имейл
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register('email')}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                                placeholder="Имейл"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-black">
                                Телефон
                            </label>
                            <input
                                id="phone"
                                type="text"
                                {...register('phone')}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                                placeholder="Телефон"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-black">
                                Парола
                            </label>
                            <input
                                id="password"
                                type="password"
                                {...register('password')}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                                placeholder="Парола"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
                                Потвърдете паролата
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                {...register('confirmPassword')}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                                placeholder="Потвърдете паролата"
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Роля - избор между клиент и треньор */}
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Роля
                            </label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value={UserRole.CLIENT}
                                        {...register('role')}
                                        className="form-radio h-4 w-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-black">Клиент</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value={UserRole.TRAINER}
                                        {...register('role')}
                                        className="form-radio h-4 w-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-black">Треньор</span>
                                </label>
                            </div>
                            {errors.role && (
                                <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
                            )}
                        </div>

                        {/* Допълнителни полета за клиенти */}
                        {watchRole === UserRole.CLIENT && (
                            <>
                                <div>
                                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-black">
                                        Дата на раждане (незадължително)
                                    </label>
                                    <input
                                        id="dateOfBirth"
                                        type="date"
                                        {...register('dateOfBirth')}
                                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                                    />
                                    {errors.dateOfBirth && (
                                        <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="healthInformation" className="block text-sm font-medium text-black">
                                        Здравна информация (незадължително)
                                    </label>
                                    <textarea
                                        id="healthInformation"
                                        {...register('healthInformation')}
                                        rows={3}
                                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                                        placeholder="Споделете здравна информация, която е важна за тренировките..."
                                    />
                                    {errors.healthInformation && (
                                        <p className="text-red-500 text-xs mt-1">{errors.healthInformation.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="fitnessGoals" className="block text-sm font-medium text-black">
                                        Фитнес цели (незадължително)
                                    </label>
                                    <textarea
                                        id="fitnessGoals"
                                        {...register('fitnessGoals')}
                                        rows={3}
                                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                                        placeholder="Опишете вашите фитнес цели..."
                                    />
                                    {errors.fitnessGoals && (
                                        <p className="text-red-500 text-xs mt-1">{errors.fitnessGoals.message}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Допълнителни полета за треньори */}
                        {watchRole === UserRole.TRAINER && (
                            <>
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-black">
                                        Биография (незадължително)
                                    </label>
                                    <textarea
                                        id="bio"
                                        {...register('bio')}
                                        rows={4}
                                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                                        placeholder="Разкажете за вашия опит, квалификации и подход..."
                                    />
                                    {errors.bio && (
                                        <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="personalPrice" className="block text-sm font-medium text-black">
                                        Цена за лична тренировка (лв) (незадължително)
                                    </label>
                                    <input
                                        id="personalPrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        {...register('personalPrice', { valueAsNumber: true })}
                                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                                        placeholder="50.00"
                                    />
                                    {errors.personalPrice && (
                                        <p className="text-red-500 text-xs mt-1">{errors.personalPrice.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="groupPrice" className="block text-sm font-medium text-black">
                                        Цена за групова тренировка (лв) (незадължително)
                                    </label>
                                    <input
                                        id="groupPrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        {...register('groupPrice', { valueAsNumber: true })}
                                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white"
                                        placeholder="25.00"
                                    />
                                    {errors.groupPrice && (
                                        <p className="text-red-500 text-xs mt-1">{errors.groupPrice.message}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                                isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            Регистрация
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;