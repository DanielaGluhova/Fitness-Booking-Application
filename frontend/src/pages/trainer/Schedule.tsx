
import { useState, useEffect } from 'react';
import { TrainerLayout } from '../../components/layout/TrainerLayout';
import { useAuth } from '../../contexts/AuthContext';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, formatISO, startOfMonth, endOfYear} from 'date-fns';
import { bg } from 'date-fns/locale';
import { TimeSlotService, TimeSlot } from '../../services/timeSlotService';
import {TrainingType, TrainingTypeCategory, TrainingTypeService} from '../../services/trainingTypeService';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EventClickArg } from '@fullcalendar/core';

// Схема за валидация на формата за създаване на времеви слот
const timeSlotSchema = z.object({
    trainingTypeId: z.string().min(1, 'Моля, изберете тип тренировка'),
    startTime: z.string().min(1, 'Необходимо е начално време'),
});

// Тип за формата
type TimeSlotFormValues = z.infer<typeof timeSlotSchema>;

const Schedule = () => {
    const { user } = useAuth();
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [generatedEndTime, setGeneratedEndTime] = useState<string>('');
    const [calculatedCapacity, setCalculatedCapacity] = useState<number>(1);

    // Използваме react-hook-form за формуляр за създаване на времеви слот
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<TimeSlotFormValues>({
        resolver: zodResolver(timeSlotSchema),
        defaultValues: {
            trainingTypeId: '',
            startTime: '',
        },
    });

    // Наблюдаваме промените в полетата
    const watchTrainingTypeId = watch('trainingTypeId');
    const watchStartTime = watch('startTime');

// Автоматично изчисляване на крайното време и капацитета при промяна на типа тренировка или началното време
    useEffect(() => {
        if (watchTrainingTypeId && watchStartTime) {
            const selectedTrainingType = trainingTypes.find(type => type.id.toString() === watchTrainingTypeId);

            if (selectedTrainingType) {
                try {
                    // Извличане компонентите на началната дата и час
                    const startDateTimeStr = watchStartTime; // "2023-05-20T10:00"
                    console.log("Избрано начално време:", startDateTimeStr);

                    // Разделяме на дата и час
                    const [startDateStr, startTimeStr] = startDateTimeStr.split('T');
                    const [startHoursStr, startMinutesStr] = startTimeStr.split(':');

                    // Превръщаме ги в числа
                    const startHours = parseInt(startHoursStr, 10);
                    const startMinutes = parseInt(startMinutesStr, 10);

                    // Изчисляваме общо минути и добавяме продължителността
                    const totalStartMinutes = startHours * 60 + startMinutes;
                    const totalEndMinutes = totalStartMinutes + selectedTrainingType.duration;

                    // Превръщаме обратно в часове и минути
                    const endHours = Math.floor(totalEndMinutes / 60) % 24; // Уверяваме се, че часовете са в обхвата 0-23
                    const endMinutes = totalEndMinutes % 60;

                    // Форматираме крайното време
                    const endHoursFormatted = endHours.toString().padStart(2, '0');
                    const endMinutesFormatted = endMinutes.toString().padStart(2, '0');
                    const endTimeStr = `${endHoursFormatted}:${endMinutesFormatted}`;

                    // Съставяме крайната дата-час
                    const endDateTimeStr = `${startDateStr}T${endTimeStr}`;
                    console.log("Изчислено крайно време:", endDateTimeStr);

                    setGeneratedEndTime(endDateTimeStr);

                    // Задаваме капацитет в зависимост от типа тренировка
                    if (selectedTrainingType.category === TrainingTypeCategory.PERSONAL) {
                        setCalculatedCapacity(1); // Персонална тренировка е само за 1 човек
                    } else if (selectedTrainingType.category === TrainingTypeCategory.GROUP && selectedTrainingType.maxClients) {
                        setCalculatedCapacity(selectedTrainingType.maxClients); // За групова използваме maxClients
                    } else {
                        setCalculatedCapacity(5); // По подразбиране, ако няма зададен maxClients
                    }

                    // Дебъг информация
                    console.log(`Начало: ${startDateStr}T${startHoursStr}:${startMinutesStr} (${startHours}:${startMinutes})`);
                    console.log(`Продължителност: ${selectedTrainingType.duration} мин`);
                    console.log(`Край: ${startDateStr}T${endHoursFormatted}:${endMinutesFormatted} (${endHours}:${endMinutes})`);
                } catch (error) {
                    console.error("Грешка при изчисляване на крайното време:", error);
                    setError("Невалидно начално време. Моля, опитайте отново.");
                }
            }
        }
    }, [watchTrainingTypeId, watchStartTime, trainingTypes]);

    // Зареждане на времеви слотове за текущия месец
    const loadTimeSlots = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const today = new Date();
            const monthStart = startOfMonth(today);
            const yearEnd = endOfYear(monthStart);

            // Форматираме датите във формат ISO
            const startISO = formatISO(monthStart);
            const endISO = formatISO(yearEnd);

            if (user && user.profileId) {
                console.log(`Зареждане на времеви слотове за треньор ${user.profileId} от ${startISO} до ${endISO}`);

                const slots = await TimeSlotService.getTimeSlotsByTrainerAndDateRange(
                    user.profileId,
                    startISO,
                    endISO
                );

                setTimeSlots(slots);
            } else {
                throw new Error('Не е намерен профил на треньор');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Грешка при зареждане на времеви слотове';
            setError(errorMessage);
            console.error('Грешка при зареждане на времеви слотове:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Зареждане на типове тренировки
    const loadTrainingTypes = async () => {
        try {
            setError(null);
            const types = await TrainingTypeService.getAllTrainingTypes();

            // Конвертираме категорията към правилния тип enum
            const processedTypes = types.map(type => ({
                ...type,
                category: type.category === 'PERSONAL'
                    ? TrainingTypeCategory.PERSONAL
                    : TrainingTypeCategory.GROUP
            }));

            setTrainingTypes(processedTypes);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Грешка при зареждане на типове тренировки';
            setError(errorMessage);
            console.error('Грешка при зареждане на типове тренировки:', err);
        }
    };

    // Зареждане на данни при инициализиране на компонента
    useEffect(() => {
        loadTrainingTypes();
        loadTimeSlots();
    }, [user]);

    // Обработка на клик върху дата в календара
    const handleDateClick = (arg: { date: Date, dateStr?: string }) => {
        setSelectedDate(arg.date);

        const date = new Date(arg.date);
        const hour = date.getHours();

        const startHour = hour < 8 ? 8 : hour;

        // Форматираме датата и часа в ISO формат за HTML input type=datetime-local
        const formattedDateTime = new Date(date.setHours(startHour, 0, 0)).toISOString().slice(0, 16);

        setValue('startTime', formattedDateTime);

        // Изчистваме избрания тип тренировка
        setValue('trainingTypeId', '');

        setIsCreateDialogOpen(true);
    };

    // Обработка на клик върху събитие в календара
    const handleEventClick = async (arg: EventClickArg) => {
        try {
            setError(null);
            const timeSlotId = parseInt(arg.event.id, 10);
            const timeSlot = await TimeSlotService.getTimeSlotById(timeSlotId);
            setSelectedTimeSlot(timeSlot);
            setIsDetailsDialogOpen(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Грешка при зареждане на детайли за времеви слот';
            setError(errorMessage);
            console.error('Грешка при зареждане на детайли за времеви слот:', err);
        }
    };

    // Създаване на нов времеви слот
    const handleCreateTimeSlot: SubmitHandler<TimeSlotFormValues> = async (data) => {
        try {
            setError(null);

            if (!user || !user.profileId) {
                throw new Error('Не е намерен профил на треньор');
            }

            const newTimeSlot: Partial<TimeSlot> = {
                trainerId: user.profileId,
                trainingTypeId: parseInt(data.trainingTypeId, 10),
                startTime: data.startTime,
                endTime: generatedEndTime,
                capacity: calculatedCapacity
            };

            await TimeSlotService.createTimeSlot(newTimeSlot);

            setSuccessMessage('Времевият слот е създаден успешно');
            setIsCreateDialogOpen(false);
            reset();
            loadTimeSlots(); // Презареждаме времевите слотове

            // Скриваме съобщението за успех след 3 секунди
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Грешка при създаване на времеви слот';
            setError(errorMessage);
            console.error('Грешка при създаване на времеви слот:', err);
        }
    };

    // Отмяна на времеви слот
    const handleCancelTimeSlot = async () => {
        try {
            setError(null);

            if (selectedTimeSlot) {
                await TimeSlotService.cancelTimeSlot(selectedTimeSlot.id);
                setSuccessMessage('Времевият слот е отменен успешно');
                setIsDetailsDialogOpen(false);
                loadTimeSlots(); // Презареждаме времевите слотове

                // Скриваме съобщението за успех след 3 секунди
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Грешка при отмяна на времеви слот';
            setError(errorMessage);
            console.error('Грешка при отмяна на времеви слот:', err);
        }
    };

    // Форматиране на времеви слотове за FullCalendar
    const calendarEvents = timeSlots.map(slot => ({
        id: slot.id.toString(),
        title: `${slot.trainingTypeName} (${slot.bookedCount}/${slot.capacity})`,
        start: slot.startTime,
        end: slot.endTime,
        backgroundColor: slot.status === 'AVAILABLE' ? '#22c55e' : slot.status === 'BOOKED' ? '#3b82f6' : '#ef4444',
        borderColor: slot.status === 'AVAILABLE' ? '#16a34a' : slot.status === 'BOOKED' ? '#2563eb' : '#dc2626',
        textColor: '#ffffff',
    }));

    // Функция за затваряне на модалния прозорец за създаване
    const closeCreateDialog = () => {
        setIsCreateDialogOpen(false);
        reset();
        setSelectedDate(null);
    };

    // Функция за затваряне на модалния прозорец за детайли
    const closeDetailsDialog = () => {
        setIsDetailsDialogOpen(false);
        setSelectedTimeSlot(null);
    };

    // Форматиране на дата за показване в модалния прозорец
    const formatSelectedDate = (date: Date | null) => {
        if (!date) return '';
        return format(date, 'dd.MM.yyyy', { locale: bg });
    };

    return (
        <TrainerLayout>
            <div className="p-4 md:p-6">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">График на тренировките</h1>
                    <p className="text-gray-600">
                        Управлявайте своите времеви слотове за тренировки
                    </p>
                </header>

                {/* Съобщение за грешка */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {/* Съобщение за успех */}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                        {successMessage}
                    </div>
                )}

                <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="h-[calc(100vh-200px)]">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next',
                                    center: 'title',
                                    right: 'dayGridMonth'
                                }}
                                locale="bg"
                                events={calendarEvents}
                                dateClick={handleDateClick}
                                eventClick={handleEventClick}
                                height="100%"
                                allDaySlot={false}
                                slotMinTime="06:00:00"
                                slotMaxTime="22:00:00"
                                slotDuration="00:30:00"
                                businessHours={{
                                    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                                    startTime: '08:00',
                                    endTime: '20:00',
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Модален прозорец за създаване на нов времеви слот */}
                {isCreateDialogOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {selectedDate ? `Добавяне на час за ${formatSelectedDate(selectedDate)}` : 'Добавяне на нов час'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={closeCreateDialog}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(handleCreateTimeSlot)} className="space-y-4">
                                {/* Тип тренировка */}
                                <div>
                                    <label htmlFor="trainingTypeId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Тип тренировка <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="trainingTypeId"
                                        {...register('trainingTypeId')}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base py-2 px-3"
                                    >
                                        <option value="">Изберете тип тренировка</option>
                                        {trainingTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name} ({type.duration} мин.)
                                            </option>
                                        ))}
                                    </select>
                                    {errors.trainingTypeId && (
                                        <p className="mt-1 text-sm text-red-600">{errors.trainingTypeId.message}</p>
                                    )}
                                </div>

                                {/* Начално време */}
                                <div>
                                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                        Начално време <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="startTime"
                                        {...register('startTime')}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base py-2 px-3"
                                    />
                                    {errors.startTime && (
                                        <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                                    )}
                                </div>

                                {/* Крайно време (изчислено автоматично) */}
                                {generatedEndTime && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Крайно време (автоматично)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={generatedEndTime}
                                            disabled
                                            className="w-full border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed text-base py-2 px-3"
                                        />
                                    </div>
                                )}

                                {/* Капацитет (изчислен автоматично) */}
                                {calculatedCapacity > 0 && watchTrainingTypeId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Капацитет (автоматично)
                                        </label>
                                        <input
                                            type="number"
                                            value={calculatedCapacity}
                                            disabled
                                            className="w-full border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed text-base py-2 px-3"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeCreateDialog}
                                        className="px-6 py-3 border-2 border-gray-300 rounded-lg shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 min-w-[100px]"
                                    >
                                        Отказ
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 border-2 border-blue-600 rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-all duration-200 min-w-[100px]"
                                    >
                                        Създай
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Модален прозорец за детайли на времеви слот */}
                {isDetailsDialogOpen && selectedTimeSlot && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Детайли за тренировка</h2>
                                <button
                                    type="button"
                                    onClick={closeDetailsDialog}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Тип тренировка</p>
                                    <p className="font-medium">{selectedTimeSlot.trainingTypeName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Начало</p>
                                    <p className="font-medium">
                                        {format(new Date(selectedTimeSlot.startTime), 'dd.MM.yyyy HH:mm')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Край</p>
                                    <p className="font-medium">
                                        {format(new Date(selectedTimeSlot.endTime), 'dd.MM.yyyy HH:mm')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Капацитет</p>
                                    <p className="font-medium">{selectedTimeSlot.bookedCount}/{selectedTimeSlot.capacity}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Статус</p>
                                    <p className={`font-medium ${
                                        selectedTimeSlot.status === 'AVAILABLE' ? 'text-green-600' :
                                            selectedTimeSlot.status === 'BOOKED' ? 'text-blue-600' :
                                                'text-red-600'
                                    }`}>
                                        {selectedTimeSlot.status === 'AVAILABLE' ? 'Свободен' :
                                            selectedTimeSlot.status === 'BOOKED' ? 'Резервиран' :
                                                'Отменен'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex space-x-3 justify-end">
                                {selectedTimeSlot.status !== 'CANCELLED' && (
                                    <button
                                        type="button"
                                        onClick={handleCancelTimeSlot}
                                        className="px-6 py-3 border-2 border-red-600 rounded-lg shadow-sm text-base font-semibold text-white bg-red-600 hover:bg-red-700 hover:border-red-700 transition-all duration-200 min-w-[120px]"
                                    >
                                        Отмени тренировка
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={closeDetailsDialog}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-lg shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 min-w-[100px]"
                                >
                                    Затвори
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TrainerLayout>
    );
};

export default Schedule;