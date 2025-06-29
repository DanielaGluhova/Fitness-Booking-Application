
import { useState, useEffect } from 'react';
import { TrainerLayout } from '../../components/layout/TrainerLayout';
import TrainingTypesManager from '../../components/trainer/TrainingTypesManager';
import { useAuth } from '../../contexts/AuthContext';
import { TrainerProfile, TrainerService } from '../../services/trainerService';

const TrainerProfilePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'trainings' | 'settings'>('profile');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

    // Състояние за редактиране
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // За специализациите
    const [newSpecialization, setNewSpecialization] = useState<string>('');

    // Форм данни
    const [formData, setFormData] = useState<Partial<TrainerProfile>>({
        fullName: '',
        email: '',
        phone: '',
        bio: '',
        personalPrice: undefined,
        groupPrice: undefined,
        specializations: []
    });

    // Извличане на данните за треньора
    const fetchTrainerProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            if (user && user.profileId) {
                const profileData = await TrainerService.getTrainerProfile(user.profileId);
                setFormData({
                    fullName: profileData.fullName,
                    email: profileData.email,
                    phone: profileData.phone || '',
                    bio: profileData.bio || '',
                    personalPrice: profileData.personalPrice,
                    groupPrice: profileData.groupPrice,
                    specializations: [...(profileData.specializations || [])]
                });
            } else {
                throw new Error('Липсва ID на треньорски профил');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Грешка при зареждане на профила';
            setError(errorMessage);
            console.error('Грешка при зареждане на данните за треньор:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainerProfile();
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'personalPrice' || name === 'groupPrice') {
            setFormData({ ...formData, [name]: value ? parseFloat(value) : undefined });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleAddSpecialization = () => {
        if (newSpecialization.trim() && !formData.specializations?.includes(newSpecialization.trim())) {
            setFormData(prev => ({
                ...prev,
                specializations: [...(prev.specializations || []), newSpecialization.trim()]
            }));
            setNewSpecialization('');
        }
    };

    const handleRemoveSpecialization = (spec: string) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations?.filter(s => s !== spec) || []
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        if (user?.profileId) {
            try {
                const updatedData = {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    bio: formData.bio,
                    personalPrice: formData.personalPrice,
                    groupPrice: formData.groupPrice,
                    specializations: formData.specializations
                };

                await TrainerService.updateTrainerProfile(user.profileId, updatedData);
                setIsEditing(false);
                setNewSpecialization(''); // Изчиствам полето за нова специализация
                setUpdateSuccess('Профилът беше успешно обновен');

                // Скриваме съобщението за успех след 3 секунди
                setTimeout(() => {
                    setUpdateSuccess(null);
                }, 3000);
            } catch (err) {
                console.error('Грешка при запазване на профила:', err);
                setError('Не успяхме да запазим данните на профила');
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <TrainerLayout>
            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-bold mb-6">Треньорски профил</h1>

                {/* Навигационни табове */}
                <div className="flex border-b mb-6">
                    <button
                        className={`py-2 px-4 ${
                            activeTab === 'profile'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Профилна информация
                    </button>
                    <button
                        className={`py-2 px-4 ${
                            activeTab === 'trainings'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('trainings')}
                    >
                        Типове тренировки
                    </button>
                </div>

                {/* Съобщение за успешно обновяване */}
                {updateSuccess && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                        {updateSuccess}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{error}</span>
                    </div>
                ) : (
                    <div>
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-lg font-medium text-gray-900">Треньорска информация</h2>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
                                        >
                                            Редактиране
                                        </button>
                                    ) : (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setNewSpecialization('');
                                                    fetchTrainerProfile(); // Възстановяваме оригиналните данни
                                                }}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm transition-colors"
                                            >
                                                Отказ
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={isSaving}
                                                className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
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
                                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                                        Име
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            name="fullName"
                                                            id="fullName"
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                            value={formData.fullName}
                                                            onChange={handleInputChange}
                                                        />
                                                    ) : (
                                                        <p className="mt-1 text-gray-900">{formData.fullName}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                        Имейл
                                                    </label>
                                                    <p className="mt-1 text-gray-900">{formData.email}</p>
                                                </div>

                                                <div>
                                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                        Телефон
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            name="phone"
                                                            id="phone"
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                        />
                                                    ) : (
                                                        <p className="mt-1 text-gray-900">{formData.phone || '-'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 space-y-6">
                                            <div>
                                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                                                    Описание
                                                </label>
                                                {isEditing ? (
                                                    <textarea
                                                        name="bio"
                                                        id="bio"
                                                        rows={4}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                        value={formData.bio || ''}
                                                        onChange={handleInputChange}
                                                    />
                                                ) : (
                                                    <p className="mt-1 text-gray-900 whitespace-pre-line">
                                                        {formData.bio || 'Няма описание'}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="personalPrice" className="block text-sm font-medium text-gray-700">
                                                        Цена за персонална тренировка (лв.)
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            name="personalPrice"
                                                            id="personalPrice"
                                                            step="0.01"
                                                            min="0"
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                            value={formData.personalPrice || ''}
                                                            onChange={handleInputChange}
                                                        />
                                                    ) : (
                                                        <p className="mt-1 text-gray-900">
                                                            {formData.personalPrice ? `${formData.personalPrice} лв.` : 'Не е зададена'}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label htmlFor="groupPrice" className="block text-sm font-medium text-gray-700">
                                                        Цена за групова тренировка (лв.)
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            name="groupPrice"
                                                            id="groupPrice"
                                                            step="0.01"
                                                            min="0"
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                            value={formData.groupPrice || ''}
                                                            onChange={handleInputChange}
                                                        />
                                                    ) : (
                                                        <p className="mt-1 text-gray-900">
                                                            {formData.groupPrice ? `${formData.groupPrice} лв.` : 'Не е зададена'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Специализации
                                                </label>

                                                {/* Показване на съществуващите специализации */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {formData.specializations && formData.specializations.length > 0 ? (
                                                        formData.specializations.map((spec, index) => (
                                                            <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
                                                                <span className="mr-1 text-gray-800">{spec}</span>
                                                                {isEditing && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveSpecialization(spec)}
                                                                        className="text-gray-500 hover:text-red-500 ml-1"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">Няма добавени специализации</p>
                                                    )}
                                                </div>

                                                {/* Поле за добавяне на нови специализации (само в режим на редактиране) */}
                                                {isEditing && (
                                                    <div className="flex">
                                                        <input
                                                            type="text"
                                                            value={newSpecialization}
                                                            onChange={(e) => setNewSpecialization(e.target.value)}
                                                            placeholder="Нова специализация"
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleAddSpecialization();
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleAddSpecialization}
                                                            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium shadow-sm transition-colors"
                                                        >
                                                            Добави
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setNewSpecialization('');
                                                    fetchTrainerProfile();
                                                }}
                                                className="bg-gray-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition-colors"
                                            >
                                                Отказ
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className={`bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-colors ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                                            >
                                                {isSaving ? 'Запазване...' : 'Запази промените'}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {activeTab === 'trainings' && <TrainingTypesManager />}
                    </div>
                )}
            </div>
        </TrainerLayout>
    );
};

export default TrainerProfilePage;