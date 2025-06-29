
// src/pages/trainer/TrainerDashboard.tsx
import { useState, useEffect } from 'react';
import { TrainerLayout } from '../../components/layout/TrainerLayout';
import { useAuth } from '../../contexts/AuthContext';
import { TimeSlotService, TimeSlot, BookedClientInfo } from '../../services/timeSlotService';
import { format, formatISO, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { bg } from 'date-fns/locale';
import ClientProfileDetails from '../../components/trainer/ClientProfileDetails';

const TrainerDashboard = () => {
    const { user } = useAuth();
    const [upcomingSlots, setUpcomingSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [timeSlotClients, setTimeSlotClients] = useState<BookedClientInfo[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const [selectedClient, setSelectedClient] = useState<BookedClientInfo | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    // Зареждане на тренировки за избрания месец
    const loadTimeSlots = async (monthDate = selectedMonth) => {
        if (!user?.profileId) return;

        setIsLoading(true);
        setError(null);

        try {
            // Вземаме тренировки за избрания месец
            const monthStart = startOfMonth(monthDate);
            const monthEnd = endOfMonth(monthDate);

            // Форматираме датите в ISO формат
            const startISO = formatISO(monthStart);
            const endISO = formatISO(monthEnd);

            const slots = await TimeSlotService.getTimeSlotsByTrainerAndDateRange(
                user.profileId,
                startISO,
                endISO
            );

            // Създаваме текуща дата за сравнение
            const currentDate = new Date();

            // Разделяме тренировките на бъдещи и минали
            const futureSlots = slots.filter(slot => new Date(slot.startTime) >= currentDate);
            const pastSlots = slots.filter(slot => new Date(slot.startTime) < currentDate);

            // Сортираме бъдещите тренировки по възходящо време (най-скорошните първо)
            futureSlots.sort((a, b) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );

            // Сортираме миналите тренировки по низходящо време (най-скорошно миналите първо)
            pastSlots.sort((a, b) =>
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );

            // Обединяваме списъците - първо бъдещите (сортирани по възходящо време), после миналите
            const sortedSlots = [...futureSlots, ...pastSlots];

            setUpcomingSlots(sortedSlots);
        } catch (error) {
            console.error('Грешка при зареждане на тренировки:', error);
            setError('Грешка при зареждане на тренировки. Моля, опитайте отново.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTimeSlots();
    }, [user?.profileId, selectedMonth]);

    // Функции за навигация между месеците
    const goToPreviousMonth = () => {
        const prevMonth = subMonths(selectedMonth, 1);
        setSelectedMonth(prevMonth);
    };

    const goToNextMonth = () => {
        const nextMonth = addMonths(selectedMonth, 1);
        setSelectedMonth(nextMonth);
    };

    const goToCurrentMonth = () => {
        setSelectedMonth(new Date());
    };

    // Функция за зареждане на клиентите за конкретен времеви слот
    const handleViewTimeSlotClients = async (slot: TimeSlot) => {
        setSelectedTimeSlot(slot);
        setTimeSlotClients([]);
        setLoadingClients(true);

        try {
            console.log(`Зареждане на клиенти за слот с ID: ${slot.id}`);

            // Използваме само един метод за извличане на клиенти
            const clients = await TimeSlotService.getClientsForTimeSlot(slot.id);

            if (clients && Array.isArray(clients)) {
                setTimeSlotClients(clients);
            } else {
                console.error('Получен невалиден формат данни за клиенти:', clients);
                setTimeSlotClients([]);
            }
        } catch (error) {
            console.error('Грешка при зареждане на клиенти за времеви слот:', error);
            setTimeSlotClients([]);
        } finally {
            setLoadingClients(false);
        }
    };

    // Функция за преглед на детайли за клиент
    const handleViewClientDetails = (client: BookedClientInfo) => {
        setSelectedClient(client);
    };

    // Форматиране само на час
    const formatTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return format(date, 'HH:mm', { locale: bg });
    };

    // Определяне дали слотът е за днес, утре или конкретна дата
    const getDateLabel = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return "Днес";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return "Утре";
        }

        return format(date, 'dd MMMM', { locale: bg });
    };

    // Превеждане и форматиране на статуса на тренировката
    const getStatusLabel = (status: string, startTime: string) => {
        const currentDate = new Date();
        const slotDate = new Date(startTime);

        // Проверяваме дали тренировката е преди днешната дата
        if (slotDate < currentDate) {
            return { label: "Приключила", className: "bg-gray-50 text-gray-600" };
        }

        switch(status) {
            case 'AVAILABLE':
                return { label: "Свободна", className: "bg-green-50 text-green-600" };
            case 'BOOKED':
                return { label: "Резервирана", className: "bg-blue-50 text-blue-600" };
            case 'CANCELLED':
                return { label: "Отменена", className: "bg-red-50 text-red-600" };
            default:
                return { label: "Неизвестен статус", className: "bg-gray-50 text-gray-600" };
        }
    };

    // Проверка дали избраният месец е текущия месец
    const isCurrentMonth = () => {
        const now = new Date();
        return selectedMonth.getFullYear() === now.getFullYear() &&
            selectedMonth.getMonth() === now.getMonth();
    };

    // Показване на детайлите за клиент, ако е избран
    if (selectedClient) {
        return (
            <TrainerLayout>
                <div className="p-6">
                    <ClientProfileDetails
                        client={selectedClient}
                        onClose={() => setSelectedClient(null)}
                    />
                </div>
            </TrainerLayout>
        );
    }

    // Показване на списъка с клиенти за конкретен времеви слот
    if (selectedTimeSlot) {
        return (
            <TrainerLayout>
                <div className="p-6">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">Клиенти за тренировка</h3>
                            <button
                                onClick={() => setSelectedTimeSlot(null)}
                                className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-indigo-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-2">Детайли за тренировката:</h4>
                                <p><span className="font-medium">Тип:</span> {selectedTimeSlot.trainingTypeName}</p>
                                <p>
                                    <span className="font-medium">Дата и час:</span> {format(new Date(selectedTimeSlot.startTime), 'dd MMMM yyyy (EEEE), HH:mm', { locale: bg })} -
                                    {format(new Date(selectedTimeSlot.endTime), ' HH:mm', { locale: bg })}
                                </p>
                                <p><span className="font-medium">Капацитет:</span> {selectedTimeSlot.bookedCount} / {selectedTimeSlot.capacity}</p>
                                <p><span className="font-medium">Статус:</span> <span className={`px-2 py-1 rounded-md text-sm ${getStatusLabel(selectedTimeSlot.status, selectedTimeSlot.startTime
                                ).className}`}>{getStatusLabel(selectedTimeSlot.status, selectedTimeSlot.startTime
                                ).label}</span></p>
                            </div>

                            {loadingClients ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : timeSlotClients.length === 0 ? (
                                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                                    <p className="text-yellow-700 font-medium mb-2">
                                        {selectedTimeSlot.status === 'AVAILABLE'
                                            ? 'Все още няма записани клиенти за този слот.'
                                            : selectedTimeSlot.status === 'CANCELLED'
                                                ? 'Тренировката е отменена.'
                                                : 'Няма информация за записани клиенти.'}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {selectedTimeSlot.status === 'AVAILABLE'
                                            ? 'Този слот е свободен и чака клиенти да се запишат.'
                                            : selectedTimeSlot.status === 'CANCELLED'
                                                ? 'Не може да се запишат клиенти за отменена тренировка.'
                                                : 'Възможна причина: Все още няма записани клиенти или има проблем с достъпа до данни.'}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Записани клиенти: {timeSlotClients.length}</h4>
                                    <div className="divide-y divide-gray-200">
                                        {timeSlotClients.map((client) => (
                                            <div key={client.id} className="py-4 flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{client.fullName}</p>
                                                    <p className="text-gray-500 text-sm">{client.email}</p>
                                                    {client.phone && <p className="text-gray-500 text-sm">{client.phone}</p>}
                                                </div>
                                                <button
                                                    onClick={() => handleViewClientDetails(client)}
                                                    className="px-4 py-2 border-2 border-purple-600 rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 hover:border-purple-700 transition-all duration-200 min-w-[90px]"
                                                >
                                                    Детайли
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                            <button
                                onClick={() => setSelectedTimeSlot(null)}
                                className="px-6 py-3 border-2 border-gray-300 rounded-lg shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 min-w-[100px]"
                            >
                                Затвори
                            </button>
                        </div>
                    </div>
                </div>
            </TrainerLayout>
        );
    }

    return (
        <TrainerLayout>
            <div className="space-y-8 p-6">
                <header>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Добре дошли, треньор {user?.fullName} !
                    </h1>
                    <p className="text-gray-600">
                        Обобщен график на тренировките
                    </p>
                </header>

                {/* Всички тренировки за месеца */}
                <div className="bg-white rounded-lg shadow p-6">
                    {/* Хедър с филтър за месец */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-800">Тренировки за</h2>

                            {/* Месечен селектор */}
                            <div className="flex items-center gap-2 bg-gray-200 border border-gray-300 rounded-lg p-1 shadow-sm">
                                <button
                                    onClick={goToPreviousMonth}
                                    className="p-2 hover:bg-gray-300 rounded-md transition-colors text-gray-700 hover:text-gray-900"
                                    title="Предишен месец"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>

                                <div className="px-4 py-2 font-semibold text-gray-900 min-w-[140px] text-center bg-white rounded border border-gray-300">
                                    {format(selectedMonth, 'MMMM yyyy', { locale: bg })}
                                </div>

                                <button
                                    onClick={goToNextMonth}
                                    className="p-2 hover:bg-gray-300 rounded-md transition-colors text-gray-700 hover:text-gray-900"
                                    title="Следващ месец"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </div>

                            {/* Бутон за връщане към текущия месец */}
                            {!isCurrentMonth() && (
                                <button
                                    onClick={goToCurrentMonth}
                                    className="px-3 py-1 text-sm border border-gray-400 rounded-md hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                                >
                                    Днес
                                </button>
                            )}
                        </div>

                        {/* Бутон за обновяване */}
                        <button
                            onClick={() => loadTimeSlots()}
                            className="px-4 py-2 border-2 border-emerald-600 rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 transition-all duration-200 flex items-center gap-2"
                            title="Обнови"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Обнови
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-md text-red-600">
                            {error}
                        </div>
                    ) : upcomingSlots.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                            </svg>
                            <p>Нямате тренировки за {format(selectedMonth, 'MMMM yyyy', { locale: bg })}.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {upcomingSlots.map((slot) => {
                                const dateLabel = getDateLabel(slot.startTime);
                                const statusInfo = getStatusLabel(slot.status, slot.startTime);

                                return (
                                    <div key={slot.id} className="py-4 first:pt-0 last:pb-0">
                                        <div className="flex items-start">
                                            {/* Лява страна - времеви индикатор */}
                                            <div className="w-16 flex-shrink-0">
                                                <div className="bg-indigo-50 text-indigo-600 rounded-md px-2 py-1 text-center text-xs font-medium">
                                                    {dateLabel}
                                                </div>
                                            </div>

                                            {/* Основна секция */}
                                            <div className="ml-4 flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium text-gray-800">
                                                            {slot.trainingTypeName || 'Тренировка'}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                        </p>
                                                    </div>

                                                    {/* Статус и капацитет */}
                                                    <div className="text-right flex flex-col gap-1">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.className}`}>
                                                            {statusInfo.label}
                                                        </span>

                                                        <div className={`text-xs px-2 py-1 rounded-full ${
                                                            slot.bookedCount === slot.capacity
                                                                ? "bg-red-50 text-red-600"
                                                                : slot.bookedCount > 0
                                                                    ? "bg-yellow-50 text-yellow-600"
                                                                    : "bg-green-50 text-green-600"
                                                        }`}>
                                                            {slot.bookedCount} / {slot.capacity}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Информация за запълненост */}
                                                <div className="mt-2 flex items-center justify-between">
                                                    <div>
                                                        {slot.status === 'AVAILABLE' && (
                                                            <p className="text-sm text-gray-500">
                                                                Свободен слот с капацитет {slot.capacity} {slot.capacity === 1 ? 'човек' : 'човека'}
                                                            </p>
                                                        )}

                                                        {slot.status === 'BOOKED' && (
                                                            <p className="text-sm text-gray-500">
                                                                Запазен слот с {slot.bookedCount} {slot.bookedCount === 1 ? 'клиент' : 'клиента'}
                                                                от общо {slot.capacity}
                                                            </p>
                                                        )}

                                                        {slot.status === 'CANCELLED' && (
                                                            <p className="text-sm text-red-500">
                                                                Тази тренировка е отменена
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Бутон за преглед на записани клиенти */}
                                                    {slot.bookedCount > 0 && (
                                                        <button
                                                            onClick={() => handleViewTimeSlotClients(slot)}
                                                            className="px-4 py-2 border-2 border-cyan-600 rounded-lg shadow-sm text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 hover:border-cyan-700 transition-all duration-200 min-w-[120px]"
                                                        >
                                                            Виж клиентите
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <a
                            href="/trainer/schedule"
                            className="px-6 py-3 border-2 border-blue-600 rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-all duration-200 inline-flex items-center gap-2"
                        >
                            Към Календара
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </TrainerLayout>
    );
};

export default TrainerDashboard;