
// src/pages/client/Book.tsx
import { useState, useEffect } from 'react';
import { ClientLayout } from '../../components/layout/ClientLayout';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../contexts/AuthContext';
import {TrainingType, TrainingTypeService} from '../../services/trainingTypeService';
import { TimeSlotService, TimeSlot } from '../../services/timeSlotService';
import { BookingService } from '../../services/bookingService';
import { format, parseISO, isAfter } from 'date-fns';
import { bg } from 'date-fns/locale';
import { TrainerProfile,TrainerService } from '../../services/trainerService';


// Компоненти за треньорите
import TrainerCard from '../../components/client/TrainerCard';
import TrainerDetailsModal from '../../components/client/TrainerDetailsModal';

// Валидационна схема с Zod
const bookingSchema = z.object({
    timeSlotId: z.number({
        required_error: 'Моля, изберете времеви слот'
    }),
    trainingTypeId: z.number({
        required_error: 'Моля, изберете тип тренировка'
    }),
    date: z.string().optional()
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const ClientBook = () => {
    const { user } = useAuth();
    const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [selectedTrainingTypeId, setSelectedTrainingTypeId] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<Record<string, unknown>[]>([]);

    // State за треньорите
    const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
    const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);
    const [showTrainerDetails, setShowTrainerDetails] = useState<boolean>(false);
    const [loadingTrainers, setLoadingTrainers] = useState<boolean>(false);

    const [step, setStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        mode: 'onChange',
        defaultValues: {
            trainingTypeId: undefined,
            timeSlotId: undefined
        }
    });

    // Наблюдаване на полета
    const watchTrainingTypeId = watch('trainingTypeId');

    // Зареждане на треньори
    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                setLoadingTrainers(true);
                const trainersData = await TrainerService.getAllTrainers();
                setTrainers(trainersData);
            } catch (err) {
                console.error('Грешка при зареждане на треньори:', err);
            } finally {
                setLoadingTrainers(false);
            }
        };

        fetchTrainers();
    }, []);

    // Функции за работа с детайлите на треньора
    const handleViewTrainerDetails = (trainer: TrainerProfile) => {
        setSelectedTrainer(trainer);
        setShowTrainerDetails(true);
    };

    const handleCloseTrainerDetails = () => {
        setShowTrainerDetails(false);
    };

    // Зареждане на типове тренировки
    useEffect(() => {
        const fetchTrainingTypes = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const trainingTypes = await TrainingTypeService.getAllTrainingTypes();
                setTrainingTypes(trainingTypes);
            } catch (err) {
                console.error('Грешка при зареждане на типове тренировки:', err);
                setError('Не успяхме да заредим типовете тренировки. Моля, опитайте отново.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrainingTypes();
    }, []);

    useEffect(() => {
        if (watchTrainingTypeId) {
            setSelectedTrainingTypeId(watchTrainingTypeId);
            loadAvailableTimeSlots(watchTrainingTypeId);
        }
    }, [watchTrainingTypeId]);

    // Зареждане на свободните слотове за избрания тип тренировка
    const loadAvailableTimeSlots = async (trainingTypeId: number) => {
        try {
            setIsLoading(true);
            setError(null);

            // Извлича свободните слотове за избрания тип тренировка
            const slots = await TimeSlotService.getAllTimeSlots();

            // Филтриране на слотовете за избрания тип тренировка и само тези, които са AVAILABLE
            const availableForType = slots.filter(slot =>
                slot.trainingTypeId === trainingTypeId &&
                slot.status === 'AVAILABLE' &&
                slot.availableSpots > 0 &&
                isAfter(new Date(slot.startTime), new Date())
            );

            setAvailableSlots(availableForType);

            // Създаване на събития за календара
            const events = availableForType.map(slot => ({
                id: slot.id,
                title: `${slot.trainingTypeName} (${format(parseISO(slot.startTime), 'HH:mm')} - ${format(parseISO(slot.endTime), 'HH:mm')})`,
                start: slot.startTime,
                end: slot.endTime,
                extendedProps: {
                    trainerName: slot.trainerName,
                    trainingTypeName: slot.trainingTypeName,
                    availableSpots: slot.availableSpots
                }
            }));

            setCalendarEvents(events);
        } catch (err) {
            console.error('Грешка при зареждане на свободни слотове:', err);
            setError('Не успяхме да заредим свободните часове. Моля, опитайте отново.');
        } finally {
            setIsLoading(false);
        }
    };

    // Обработка на избор на събитие от календара
    const handleEventClick = (info: { event: { id: string } }) => {
        const slotId = parseInt(info.event.id);
        const selectedSlot = availableSlots.find(slot => slot.id === slotId);

        if (selectedSlot) {
            setSelectedSlot(selectedSlot);
            setValue('timeSlotId', slotId);

            // Преминаване към следващата стъпка
            setStep(3);
        }
    };

    // Обработка на изпращане на формуляра
    const onSubmit = async (data: BookingFormValues) => {
        if (!user?.profileId) {
            setError('Не сте влезли в системата или нямате клиентски профил.');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            await BookingService.createBooking(user.profileId, data.timeSlotId);
            setBookingConfirmed(true);
            setSuccessMessage('Резервацията е създадена успешно!');

            // Нулиране на формуляра
            setValue('timeSlotId', undefined as unknown as number);
            setSelectedSlot(null);

        } catch (err: unknown) {
            console.error('Грешка при създаване на резервация:', err);
            if (err instanceof Error) {
                setError(err.message || 'Грешка при създаване на резервацията. Моля, опитайте отново.');
            } else {
                setError('Грешка при създаване на резервацията. Моля, опитайте отново.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Форматиране на дата и час
    const formatDateTime = (dateTimeStr: string) => {
        const date = parseISO(dateTimeStr);
        return format(date, 'dd MMMM yyyy (EEEE) HH:mm', { locale: bg });
    };

    return (
        <ClientLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-2xl font-bold mb-6">Резервация на тренировка</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                        {successMessage}
                    </div>
                )}

                {bookingConfirmed ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2">Резервацията е потвърдена!</h2>
                        <p className="text-gray-600 mb-4">Вашата резервация беше създадена успешно.</p>
                        <div className="mt-6 flex justify-center space-x-4">
                            <button
                                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                onClick={() => {
                                    setBookingConfirmed(false);
                                    setSuccessMessage(null);
                                    setStep(1);
                                }}
                            >
                                Създай нова резервация
                            </button>
                            <a
                                href="/client/bookings"
                                className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium shadow-sm"
                            >
                                Виж моите резервации
                            </a>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Първо показваме формуляра за резервации */}
                        <div className="mb-8">
                            {/* Стъпки на резервация */}
                            <div className="mb-8">
                                <div className="flex items-center">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        1
                                    </div>
                                    <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        2
                                    </div>
                                    <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        3
                                    </div>
                                </div>
                                <div className="flex justify-between mt-2 text-sm">
                                    <div className={`${step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Избор на тип тренировка</div>
                                    <div className={`${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Избор на дата и час</div>
                                    <div className={`${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Потвърждение</div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)}>
                                {step === 1 && (
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h2 className="text-xl font-bold mb-6">Изберете тип тренировка</h2>

                                        <div className="mb-6">
                                            <label htmlFor="trainingTypeId" className="block text-sm font-medium text-gray-700 mb-1">
                                                Тип тренировка
                                            </label>
                                            <Controller
                                                name="trainingTypeId"
                                                control={control}
                                                render={({ field }) => (
                                                    <select
                                                        {...field}
                                                        id="trainingTypeId"
                                                        className={`w-full p-2 border rounded-md ${errors.trainingTypeId ? 'border-red-500' : 'border-gray-300'}`}
                                                        onChange={(e) => {
                                                            field.onChange(parseInt(e.target.value));
                                                        }}
                                                        value={field.value || ''}
                                                        disabled={isLoading}
                                                    >
                                                        <option value="">Изберете тип тренировка</option>
                                                        {trainingTypes.map(type => (
                                                            <option key={type.id} value={type.id}>
                                                                {type.name} - {type.duration} мин.
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            />
                                            {errors.trainingTypeId && (
                                                <p className="mt-1 text-sm text-red-600">{errors.trainingTypeId.message}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end mt-6">
                                            <button
                                                type="button"
                                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors"
                                                onClick={() => setStep(2)}
                                                disabled={!selectedTrainingTypeId || isLoading}
                                            >
                                                Продължи
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h2 className="text-xl font-bold mb-6">Изберете дата и час</h2>

                                        {isLoading ? (
                                            <div className="flex justify-center items-center h-64">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                                            </div>
                                        ) : availableSlots.length === 0 ? (
                                            <div className="text-center py-12">
                                                <p className="text-gray-600">Няма налични часове за избрания тип тренировка.</p>
                                                <button
                                                    type="button"
                                                    className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium shadow-sm"
                                                    onClick={() => setStep(1)}
                                                >
                                                    Назад
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mb-6">
                                                    <FullCalendar
                                                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                                        initialView="dayGridMonth"
                                                        headerToolbar={{
                                                            left: 'prev,next today',
                                                            center: 'title',
                                                            right: 'dayGridMonth,timeGridWeek'
                                                        }}
                                                        events={calendarEvents}
                                                        eventClick={handleEventClick}
                                                        height="auto"
                                                        locale="bg"
                                                    />
                                                </div>

                                                <div className="flex justify-between mt-6">
                                                    <button
                                                        type="button"
                                                        className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium shadow-sm"
                                                        onClick={() => setStep(1)}
                                                    >
                                                        Назад
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {step === 3 && selectedSlot && (
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h2 className="text-xl font-bold mb-6">Потвърждение на резервацията</h2>

                                        <div className="bg-gray-50 p-4 rounded-md mb-6">
                                            <h3 className="font-medium text-lg mb-2">Детайли на резервацията:</h3>
                                            <ul className="space-y-2">
                                                <li><span className="font-medium">Треньор:</span> {selectedSlot.trainerName}</li>
                                                <li><span className="font-medium">Тип тренировка:</span> {selectedSlot.trainingTypeName}</li>
                                                <li><span className="font-medium">Дата и час:</span> {formatDateTime(selectedSlot.startTime)} - {format(parseISO(selectedSlot.endTime), 'HH:mm')}</li>
                                                <li><span className="font-medium">Свободни места:</span> {selectedSlot.availableSpots}</li>
                                            </ul>
                                        </div>

                                        <div className="flex justify-between mt-6">
                                            <button
                                                type="button"
                                                className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium shadow-sm"
                                                onClick={() => setStep(2)}
                                            >
                                                Назад
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Обработка...' : 'Потвърди резервацията'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* След това показваме секцията с треньори */}
                        <div className="mt-10">
                            <h2 className="text-xl font-bold mb-4">Нашите треньори</h2>

                            {loadingTrainers ? (
                                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                                    </div>
                                    <p className="text-gray-600">Зареждане на треньори...</p>
                                </div>
                            ) : trainers.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                    <p className="text-gray-600">Няма налични треньори в момента.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {trainers.map(trainer => (
                                        <TrainerCard
                                            key={trainer.id}
                                            trainer={trainer}
                                            onViewDetails={() => handleViewTrainerDetails(trainer)}
                                        />
                                    ))}
                                </div>
                            )}

                            {showTrainerDetails && selectedTrainer && (
                                <TrainerDetailsModal
                                    trainer={selectedTrainer}
                                    onClose={handleCloseTrainerDetails}
                                />
                            )}
                        </div>

                    </div>
                )}
            </div>
        </ClientLayout>
    );
};

export default ClientBook;