// src/pages/client/Profile.tsx
import { useState, useEffect } from 'react';
import { ClientLayout } from '../../components/layout/ClientLayout';
import { useAuth } from '../../contexts/AuthContext';
import {ClientProfile, ClientService} from '../../services/clientService';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<ClientProfile>>({
        fullName: '',
        email: '',
        phone: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.profileId) {
                try {
                    const profileData = await ClientService.getClientProfile(user.profileId);
                    setFormData({
                        fullName: profileData.fullName,
                        email: profileData.email,
                        phone: profileData.phone || '',
                        dateOfBirth: profileData.dateOfBirth,
                        healthInformation: profileData.healthInformation,
                        fitnessGoals: profileData.fitnessGoals
                    });
                } catch (err) {
                    console.error('Грешка при зареждане на профила:', err);
                    setError('Не успяхме да заредим данните на профила');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProfile();
    }, [user?.profileId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        if (user?.profileId) {
            try {
                const updatedData = {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    dateOfBirth: formData.dateOfBirth,
                    healthInformation: formData.healthInformation,
                    fitnessGoals: formData.fitnessGoals,
                };

                await ClientService.updateClientProfile(user.profileId, updatedData);
                setIsEditing(false);
            } catch (err) {
                console.error('Грешка при запазване на профила:', err);
                setError('Не успяхме да запазим данните на профила');
            } finally {
                setIsSaving(false);
            }
        }
    };

    // Форматира дата от формат 'YYYY-MM-DD' към 'DD.MM.YYYY'
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG');
    };

    if (loading) {
        return (
            <ClientLayout>
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </ClientLayout>
        );
    }

    if (error) {
        return (
            <ClientLayout>
                <div className="text-center text-red-600">
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Опитайте отново
                    </button>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            <div className="max-w-4xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-black">Моят профил</h1>
                    <p className="text-gray-600">
                        Управлявайте вашата лична информация и предпочитания за тренировки
                    </p>
                </header>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-black">Лична информация</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                            >
                                Редактиране
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                                >
                                    Отказ
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? 'Запазване...' : 'Запази'}
                                </button>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-2/3 space-y-4">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-black">
                                            Име
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="fullName"
                                                id="fullName"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white text-black"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            <p className="mt-1 text-black">{formData.fullName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-black">
                                            Имейл
                                        </label>
                                        {/* Имейлът е винаги само за четене */}
                                        <p className="mt-1 text-black">{formData.email}</p>
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-black">
                                            Телефон
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="phone"
                                                id="phone"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white text-black"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            <p className="mt-1 text-black">{formData.phone || '-'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-black">
                                            Дата на раждане
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                id="dateOfBirth"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white text-black"
                                                value={formData.dateOfBirth || ''}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            <p className="mt-1 text-black">{formatDate(formData.dateOfBirth)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div>
                                    <label htmlFor="healthInformation" className="block text-sm font-medium text-black">
                                        Информация за здравето
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="healthInformation"
                                            id="healthInformation"
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white text-black"
                                            value={formData.healthInformation || ''}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        <p className="mt-1 text-black whitespace-pre-line">
                                            {formData.healthInformation || 'Няма въведена информация за здравето'}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <label htmlFor="fitnessGoals" className="block text-sm font-medium text-black">
                                        Фитнес цели
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="fitnessGoals"
                                            id="fitnessGoals"
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white text-black"
                                            value={formData.fitnessGoals || ''}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        <p className="mt-1 text-black whitespace-pre-line">
                                            {formData.fitnessGoals || 'Няма въведени фитнес цели'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Секцията "Настройки на акаунта" е премахната */}
            </div>
        </ClientLayout>
    );
};

export default Profile;