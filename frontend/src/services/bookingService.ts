// src/services/bookingService.ts
import {API_URL, getToken} from "./api.ts";

export enum BookingStatus {
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
}

// Дефиниране на интерфейсите
export interface Booking {
    id: number;
    clientId: number;
    clientName: string;
    timeSlotId: number;
    trainerId: number;
    trainerName: string;
    trainingTypeName: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    notes?: string;
    formattedDate: string;
    formattedTime: string;
}

export const BookingService = {
    // Създаване на нова резервация
    createBooking: async (clientId: number, timeslotId: number): Promise<Booking> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const body: Partial<Booking> = {timeSlotId: timeslotId}
            const response = await fetch(`${API_URL}/bookings/client/${clientId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Нямате права за достъп или сесията е изтекла');
                }

                const errorText = await response.text();
                throw new Error(`Неуспешно създаване на резервация: ${errorText}`);
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при създаване на резервация:', error);
            throw error;
        }
    },


    // Извличане на всички резервации на клиент
    getClientBookings: async (clientId: number): Promise<Booking[]> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const response = await fetch(`${API_URL}/bookings/client/${clientId}/bookings`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Нямате права за достъп или сесията е изтекла');
                }
                throw new Error('Неуспешно извличане на резервации');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при извличане на резервации:', error);
            throw error;
        }
    },

    updateBookingStatus: async (bookingId: number, newStatus: BookingStatus): Promise<Booking> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({status: newStatus}),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Нямате права за достъп или сесията е изтекла');
                }
                if (response.status === 404) {
                    throw new Error('Резервацията не е намерена');
                }
                throw new Error('Неуспешно обновяване на статуса на резервацията');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при обновяване на статуса на резервация:', error);
            throw error;
        }
    },

    // Отмяна на резервация
    cancelBooking: async (bookingId: number): Promise<Booking> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Нямате права за достъп или сесията е изтекла');
                }
                if (response.status === 404) {
                    throw new Error('Резервацията не е намерена');
                }
                throw new Error('Неуспешно отменяне на резервацията');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при отменяне на резервация:', error);
            throw error;
        }
    }
};