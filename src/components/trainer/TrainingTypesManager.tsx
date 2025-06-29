
// src/components/trainer/TrainingTypesManager.tsx
import { useState, useEffect } from 'react';
import {TrainingType, TrainingTypeCategory, TrainingTypeService} from '../../services/trainingTypeService';

const defaultFormData: Partial<TrainingType> = {
    name: '',
    description: '',
    duration: 60,
    category: TrainingTypeCategory.PERSONAL,
    maxClients: null
};

const TrainingTypesManager = () => {
    const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
    const [formData, setFormData] = useState<Partial<TrainingType>>(defaultFormData);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | undefined>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Зареждане на всички типове тренировки
    const loadTrainingTypes = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await TrainingTypeService.getAllTrainingTypes();
            setTrainingTypes(data);
        } catch {
            setError('Грешка при зареждане на типове тренировки');
            console.error('Грешка при зареждане на типове тренировки');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTrainingTypes();
    }, []);

    // Функция за скролване нагоре
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Обработка на промени във формуляра
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === 'duration' || (name === 'maxClients' && value)
                ? parseInt(value, 10)
                : name === 'maxClients' && !value
                    ? null
                    : value,
        }));
    };

    // Редактиране на тип тренировка
    const handleEdit = (trainingType: Partial<TrainingType>) => {
        setFormData({
            name: trainingType.name,
            description: trainingType.description,
            duration: trainingType.duration,
            category: trainingType.category,
            maxClients: trainingType.maxClients,
        });
        setIsEditing(true);
        setEditingId(trainingType.id);
        setError(null);
        setSuccess(null);

        // Скролване нагоре след къс delay за да се обнови състоянието
        setTimeout(scrollToTop, 100);
    };

    // Отказване на редактирането
    const handleCancel = () => {
        setFormData(defaultFormData);
        setIsEditing(false);
        setEditingId(0);
        setError(null);
        setSuccess(null);
    };

    // Изпращане на формуляра
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (isEditing && editingId) {
                // Актуализиране на съществуващ тип
                await TrainingTypeService.updateTrainingType(editingId, formData);
                setSuccess('Типът тренировка беше успешно актуализиран');
            } else {
                // Създаване на нов тип
                await TrainingTypeService.createTrainingType(formData);
                setSuccess('Типът тренировка беше успешно създаден');
            }

            // Презареждане на списъка и изчистване на формуляра
            await loadTrainingTypes();
            setFormData(defaultFormData);
            setIsEditing(false);
            setEditingId(0);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Възникна грешка при запазване на типа тренировка');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Изтриване на тип тренировка
    const handleDelete = async (id: number) => {
        if (!window.confirm('Сигурни ли сте, че искате да изтриете този тип тренировка?')) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await TrainingTypeService.deleteTrainingType(id);
            setSuccess('Типът тренировка беше успешно изтрит');
            await loadTrainingTypes();
        } catch {
            setError('Грешка при изтриване на типа тренировка');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-black">{isEditing ? 'Редактиране на тип тренировка' : 'Добавяне на нов тип тренировка'}</h2>

            {/* Форма за създаване/редактиране */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">{error}</div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md border border-green-300">{success}</div>
                )}

                <div className="mb-4">
                    <label className="block text-black font-medium mb-2" htmlFor="name">
                        Име на тренировката
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-black font-medium mb-2" htmlFor="description">
                        Описание
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                        rows={3}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-black font-medium mb-2" htmlFor="duration">
                        Продължителност (минути)
                    </label>
                    <input
                        id="duration"
                        name="duration"
                        type="number"
                        min="15"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-black font-medium mb-2" htmlFor="category">
                        Категория
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                        required
                    >
                        <option value={TrainingTypeCategory.PERSONAL}>Персонална</option>
                        <option value={TrainingTypeCategory.GROUP}>Групова</option>
                    </select>
                </div>

                {formData.category === TrainingTypeCategory.GROUP && (
                    <div className="mb-4">
                        <label className="block text-black font-medium mb-2" htmlFor="maxClients">
                            Максимален брой клиенти
                        </label>
                        <input
                            id="maxClients"
                            name="maxClients"
                            type="number"
                            min="2"
                            value={formData.maxClients || ''}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                            required={formData.category === TrainingTypeCategory.GROUP}
                        />
                    </div>
                )}

                <div className="flex justify-end space-x-2">
                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-medium rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            Отказ
                        </button>
                    )}

                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Запазване...' : isEditing ? 'Актуализиране' : 'Създаване'}
                    </button>
                </div>
            </form>

            {/* Списък с типове тренировки */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-black mb-4">Налични типове тренировки</h2>

                {isLoading && !trainingTypes.length ? (
                    <div className="text-center p-4">
                        <div className="inline-block animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
                        <p className="mt-2 text-gray-600">Зареждане...</p>
                    </div>
                ) : trainingTypes.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600">Няма създадени типове тренировки</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {trainingTypes.map((trainingType) => (
                            <div key={trainingType.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                <div className="mb-2">
                                    <h3 className="text-lg font-semibold text-black">{trainingType.name}</h3>
                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                        trainingType.category === TrainingTypeCategory.PERSONAL
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {trainingType.category === TrainingTypeCategory.PERSONAL ? 'Персонална' : 'Групова'}
                                    </span>
                                </div>

                                {trainingType.description && (
                                    <p className="text-gray-600 text-sm mb-2">{trainingType.description}</p>
                                )}

                                <div className="space-y-1 text-sm text-gray-600 mb-3">
                                    <p><span className="font-medium">Продължителност:</span> {trainingType.duration} мин</p>
                                    {trainingType.category === TrainingTypeCategory.GROUP && trainingType.maxClients && (
                                        <p><span className="font-medium">Макс. клиенти:</span> {trainingType.maxClients}</p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => handleEdit(trainingType)}
                                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition-colors"
                                        disabled={isLoading}
                                    >
                                        Редактиране
                                    </button>
                                    <button
                                        onClick={() => handleDelete(trainingType.id!)}
                                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded transition-colors"
                                        disabled={isLoading}
                                    >
                                        Изтриване
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingTypesManager;