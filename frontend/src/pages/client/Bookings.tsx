
import {useState, useEffect, useCallback} from 'react';
import {ClientLayout} from '../../components/layout/ClientLayout';
import {Link} from 'react-router-dom';
import {Booking, BookingService, BookingStatus} from '../../services/bookingService';
import {TrainerProfile,TrainerService} from '../../services/trainerService';
import {TrainingType, TrainingTypeCategory, TrainingTypeService} from '../../services/trainingTypeService';
import {useAuth} from '../../contexts/AuthContext';
import {format, parseISO, isBefore} from 'date-fns';
import {bg} from 'date-fns/locale';

interface BookingWithPrice extends Booking {
    price: number;
    location?: string;
    category?: TrainingTypeCategory;
    displayStatus?: BookingStatus;
}


const ClientBookings = () => {
    const {user} = useAuth();
    const [bookings, setBookings] = useState<BookingWithPrice[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<BookingWithPrice[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trainers, setTrainers] = useState<Map<number, TrainerProfile>>(new Map());
    const [trainingTypes, setTrainingTypes] = useState<Map<string, TrainingType>>(new Map());

    const [showModal, setShowModal] = useState(false);
    const [selectedBooking] = useState<BookingWithPrice | null>(null);

    // Зареждане на данни за треньорите
    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const trainersList = await TrainerService.getAllTrainers();
                const trainersMap = new Map(trainersList.map(trainer => [trainer.id, trainer]));
                setTrainers(trainersMap);
            } catch (err) {
                console.error('Грешка при зареждане на треньори:', err);
            }
        };

        fetchTrainers();
    }, []);

    // Зареждане на данни за типовете тренировки
    useEffect(() => {
        const fetchTrainingTypes = async () => {
            try {
                const trainingTypesList = await TrainingTypeService.getAllTrainingTypes()
                const trainingTypesMap = new Map(trainingTypesList.map(type => [type.name, type]));
                setTrainingTypes(trainingTypesMap);
            } catch (err) {
                console.error('Грешка при зареждане на типове тренировки:', err);
            }
        };

        fetchTrainingTypes();
    }, []);

    // Помощна функция за изчисляване на цена на базата на типа тренировка и треньора
    const calculatePrice = useCallback((trainingTypeName: string, trainerId: number): {
        price: number,
        category?: TrainingTypeCategory
    } => {
        const trainingType = trainingTypes.get(trainingTypeName);
        const trainer = trainers.get(trainerId);

        if (!trainingType || !trainer) {
            return {price: 0};
        }

        // На базата на категорията взимаме правилната цена от профила на треньора
        let price = 0;
        switch (trainingType.category) {
            case TrainingTypeCategory.PERSONAL:
                price = trainer.personalPrice;
                break;
            case TrainingTypeCategory.GROUP:
                price = trainer.groupPrice;
        }

        return {price, category: trainingType.category};
    }, [trainers, trainingTypes]);

    // Функция за проверка дали една тренировка е приключила
    const isTrainingCompleted = (endTimeStr: string): boolean => {
        const endTime = new Date(endTimeStr);
        const now = new Date();
        return isBefore(endTime, now);
    };

    // Функция за обновяване на статуса на тренировка в бекенда
    const updateBookingStatus = async (bookingId: number, newStatus: BookingStatus) => {
        try {
            await BookingService.updateBookingStatus(bookingId, newStatus);
        } catch (err) {
            console.error(`Грешка при обновяване на статуса на резервация ${bookingId}:`, err);
        }
    };

    // Функция за проверка на всички тренировки и актуализиране на статусите
    const checkAndUpdateCompletedTrainings = async (bookingsToCheck: BookingWithPrice[]) => {
        const now = new Date();
        const completedBookings = bookingsToCheck.filter(
            booking => booking.status === BookingStatus.CONFIRMED && isBefore(new Date(booking.endTime), now)
        );

        if (completedBookings.length === 0) return;

        try {
            await Promise.all(
                completedBookings.map(booking =>
                    updateBookingStatus(booking.id, BookingStatus.COMPLETED)
                )
            );
        } catch (err) {
            console.error('Грешка при обновяване на статусите на тренировките:', err);
        }
    };

    // Зареждане на резервациите
    const fetchBookings = useCallback(async () => {
        if (!user?.profileId || trainers.size === 0 || trainingTypes.size === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await BookingService.getClientBookings(user.profileId);

            // Трансформиране на данните с изчисление на цена
            const transformedBookings: BookingWithPrice[] = data.map(booking => {
                // Изчисляваме цената и категорията на базата на името на тренировката
                const {price, category} = calculatePrice(booking.trainingTypeName, booking.trainerId);

                // Проверяваме дали потвърдената тренировка е приключила
                let displayStatus = booking.status;
                if (booking.status === BookingStatus.CONFIRMED && isTrainingCompleted(booking.endTime)) {
                    displayStatus = BookingStatus.COMPLETED;
                }

                return {
                    ...booking,
                    price,
                    category,
                    location: '',
                    displayStatus
                };
            });

            // Проверяваме дали има тренировки, които трябва да бъдат маркирани като приключили
            const now = new Date();
            const needsBackendUpdate = transformedBookings.some(
                booking => booking.status === BookingStatus.CONFIRMED &&
                    isBefore(new Date(booking.endTime), now)
            );

            if (needsBackendUpdate) {
                checkAndUpdateCompletedTrainings(transformedBookings);
            }

            // Сортиране на резервации от най-скорошни към най-далечни
            const sortedBookings = transformedBookings.sort((a, b) => {
                // Използваме displayStatus за сортиране
                const statusA = a.displayStatus || a.status;
                const statusB = b.displayStatus || b.status;

                // За потвърдени резервации - от най-скорошни към най-далечни
                if (statusA === BookingStatus.CONFIRMED && statusB === BookingStatus.CONFIRMED) {
                    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
                }

                // Приключилите тренировки са след потвърдените
                if (statusA === BookingStatus.CONFIRMED && statusB === BookingStatus.COMPLETED) {
                    return -1;
                }
                if (statusA === BookingStatus.COMPLETED && statusB === BookingStatus.CONFIRMED) {
                    return 1;
                }

                // За приключили тренировки - от най-скорошно завършили към най-отдавна завършили
                if (statusA === BookingStatus.COMPLETED && statusB === BookingStatus.COMPLETED) {
                    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
                }

                // Отменените тренировки са най-накрая
                if (statusA === BookingStatus.CANCELLED && statusB !== BookingStatus.CANCELLED) {
                    return 1;
                }
                if (statusA !== BookingStatus.CANCELLED && statusB === BookingStatus.CANCELLED) {
                    return -1;
                }

                // За отменени тренировки - от най-скоро отменени към най-отдавна отменени
                return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
            });

            setBookings(sortedBookings);
        } catch (err) {
            console.error('Грешка при зареждане на резервациите:', err);
            setError('Грешка при зареждане на резервациите. Моля, опитайте по-късно.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.profileId, trainers.size, trainingTypes.size, calculatePrice]);

    useEffect(() => {
        // Зареждаме резервациите само ако имаме заредени треньори и типове тренировки
        if (trainers.size > 0 && trainingTypes.size > 0 && user?.profileId) {
            fetchBookings();
        }
    }, [fetchBookings]);

    // Филтриране на резервациите
    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredBookings(bookings);
        } else {
            // Филтрираме по displayStatus (ако е наличен), иначе по status
            setFilteredBookings(bookings.filter(booking =>
                (booking.displayStatus || booking.status) === statusFilter
            ));
        }
    }, [statusFilter, bookings]);

    // Получаване на подходящ стилизиран бадж за статуса
    const getStatusBadge = (booking: BookingWithPrice) => {
        // Използваме displayStatus, ако е наличен, иначе използваме status
        const status = booking.displayStatus || booking.status;

        switch (status) {
            case BookingStatus.CONFIRMED:
                return (
                    <span
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Потвърдена
                    </span>
                );
            case BookingStatus.COMPLETED:
                return (
                    <span
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Приключила
                    </span>
                );
            case BookingStatus.CANCELLED:
                return (
                    <span
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Отменена
                    </span>
                );
            default:
                return null;
        }
    };

    // Преобразуване на статус в текст на български
    const getStatusText = (booking: BookingWithPrice) => {
        // Използваме displayStatus, ако е наличен, иначе използваме status
        const status = booking.displayStatus || booking.status;

        switch (status) {
            case BookingStatus.CONFIRMED:
                return 'Потвърдена';
            case BookingStatus.COMPLETED:
                return 'Приключила';
            case BookingStatus.CANCELLED:
                return 'Отменена';
            default:
                return status;
        }
    };

    // Получаване на бадж за категорията тренировка
    const getCategoryBadge = (category?: TrainingTypeCategory) => {
        if (!category) return null;

        switch (category) {
            case TrainingTypeCategory.PERSONAL:
                return (
                    <span
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        Персонална
                    </span>
                );
            case TrainingTypeCategory.GROUP:
                return (
                    <span
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        Групова
                    </span>
                );
            default:
                return null;
        }
    };

    // Форматиране на дата и час
    const formatDateTime = (dateTimeStr: string) => {
        const date = parseISO(dateTimeStr);
        return format(date, 'dd MMMM yyyy (EEEE)', {locale: bg});
    };

    const formatTime = (dateTimeStr: string) => {
        const date = parseISO(dateTimeStr);
        return format(date, 'HH:mm', {locale: bg});
    };

    // Форматиране на дата за показване в таблицата
    const formatShortDate = (dateTimeStr: string) => {
        const date = parseISO(dateTimeStr);
        return format(date, 'dd.MM.yyyy', {locale: bg});
    };

    // Отмяна на резервация
    const cancelBooking = async (id: number) => {
        if (!window.confirm('Сигурни ли сте, че искате да отмените тази резервация?')) {
            return;
        }

        setIsLoading(true);
        try {
            await BookingService.cancelBooking(id);

            // Обновяване на списъка с резервации
            fetchBookings();

            // Ако отменената резервация е отворена в детайли, затваряме модалния прозорец
            if (selectedBooking?.id === id) {
                setShowModal(false);
            }
        } catch (err) {
            console.error('Грешка при отмяна на резервация:', err);
            alert('Възникна грешка при отмяна на резервацията.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ClientLayout>
            <div className="space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Моите резервации</h1>
                        <p className="text-gray-600">
                            Преглед и управление на всички ваши тренировки
                        </p>
                    </div>
                    <Link
                        to="/client/book"
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors"
                    >
                        Резервирай нов час
                    </Link>
                </header>

                {/* Съобщение за грешка */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                {/* Филтри */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => setStatusFilter('all')}
                        >
                            Всички
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                statusFilter === BookingStatus.CONFIRMED ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => setStatusFilter(BookingStatus.CONFIRMED)}
                        >
                            Потвърдени
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                statusFilter === BookingStatus.COMPLETED ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => setStatusFilter(BookingStatus.COMPLETED)}
                        >
                            Приключили
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                statusFilter === BookingStatus.CANCELLED ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => setStatusFilter(BookingStatus.CANCELLED)}
                        >
                            Отменени
                        </button>
                    </div>
                </div>

                {/* Списък с резервации */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div
                                className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
                            <p className="text-gray-500">Зареждане на резервации...</p>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 mb-4">Няма намерени резервации</p>
                            <Link
                                to="/client/book"
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors"
                            >
                                Резервирай сега
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Треньор
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Тип тренировка
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Дата и час
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Статус
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Цена
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Действия
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{booking.trainerName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{booking.trainingTypeName}</div>
                                            <div className="mt-1">{getCategoryBadge(booking.category)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div
                                                className="text-sm text-gray-900">{formatShortDate(booking.startTime)}</div>
                                            <div
                                                className="text-sm text-gray-500">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(booking)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {booking.price} лв.
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                {/* Проверяваме displayStatus, ако е наличен */}
                                                {((booking.displayStatus || booking.status) === BookingStatus.CONFIRMED) && (
                                                    <button
                                                        onClick={() => cancelBooking(booking.id)}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm transition-colors"
                                                        disabled={isLoading}
                                                    >
                                                        Отмени
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Модален прозорец за детайли */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Детайли на резервацията</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                            <div className="divide-y divide-gray-200">
                                <div className="py-3 flex">
                                    <div className="w-1/3 text-gray-500">Статус:</div>
                                    <div className="w-2/3 font-medium text-gray-900">
                                        {getStatusBadge(selectedBooking)}
                                        <span className="ml-2">{getStatusText(selectedBooking)}</span>
                                    </div>
                                </div>

                                <div className="py-3 flex">
                                    <div className="w-1/3 text-gray-500">Треньор:</div>
                                    <div className="w-2/3 font-medium text-gray-900">{selectedBooking.trainerName}</div>
                                </div>

                                <div className="py-3 flex">
                                    <div className="w-1/3 text-gray-500">Тип тренировка:</div>
                                    <div className="w-2/3 font-medium text-gray-900">
                                        {selectedBooking.trainingTypeName}
                                        {selectedBooking.category && (
                                            <div className="mt-1">{getCategoryBadge(selectedBooking.category)}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="py-3 flex">
                                    <div className="w-1/3 text-gray-500">Дата:</div>
                                    <div
                                        className="w-2/3 font-medium text-gray-900">{formatDateTime(selectedBooking.startTime)}</div>
                                </div>

                                <div className="py-3 flex">
                                    <div className="w-1/3 text-gray-500">Време:</div>
                                    <div className="w-2/3 font-medium text-gray-900">
                                        {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                                    </div>
                                </div>

                                {selectedBooking.location && (
                                    <div className="py-3 flex">
                                        <div className="w-1/3 text-gray-500">Локация:</div>
                                        <div
                                            className="w-2/3 font-medium text-gray-900">{selectedBooking.location}</div>
                                    </div>
                                )}

                                <div className="py-3 flex">
                                    <div className="w-1/3 text-gray-500">Цена:</div>
                                    <div className="w-2/3 font-medium text-gray-900">{selectedBooking.price} лв.</div>
                                </div>

                                {selectedBooking.notes && (
                                    <div className="py-3">
                                        <div className="text-gray-500 mb-1">Бележки:</div>
                                        <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                                            {selectedBooking.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-2">
                            {/* Проверяваме displayStatus, ако е наличен */}
                            {((selectedBooking.displayStatus || selectedBooking.status) === BookingStatus.CONFIRMED) && (
                                <button
                                    onClick={() => cancelBooking(selectedBooking.id)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm transition-colors"
                                    disabled={isLoading}
                                >
                                    Отмени резервацията
                                </button>
                            )}
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium shadow-sm transition-colors"
                            >
                                Затвори
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
};

export default ClientBookings;