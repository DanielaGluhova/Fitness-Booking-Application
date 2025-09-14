// src/services/timeSlotService.ts
// Дефиниране на интерфейсите
import {API_URL, getToken, handleHttpError} from "./api.ts";
import {ClientProfile} from "./clientService.ts";

export interface TimeSlot {
    id: number;
    trainerId: number;
    trainerName: string;
    trainingTypeId: number;
    trainingTypeName: string;
    startTime: string;
    endTime: string;
    capacity: number;
    bookedCount: number;
    status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED';
    availableSpots: number;
}

// Интерфейс за информация за клиенти в времеви слот
export type BookedClientInfo = ClientProfile

// Помощна функция за създаване на автентикирани заявки
const createAuthenticatedRequest = (method: string, body?: unknown): RequestInit => {
    const token = getToken();
    if (!token) {
        throw new Error('Не сте влезли в системата. Моля, влезте отново.');
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const request: RequestInit = { method, headers };
    if (body) {
        request.body = JSON.stringify(body);
    }

    return request;
};

export const TimeSlotService = {
    // Извличане на всички времеви слотове
    getAllTimeSlots: async (): Promise<TimeSlot[]> => {
        try {
            const response = await fetch(`${API_URL}/time-slots`, createAuthenticatedRequest('GET'));
            if (!response.ok) {
                await handleHttpError(response, 'Неуспешно извличане на списъка с времеви слотове');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при извличане на списъка с времеви слотове:', error);
            throw error;
        }
    },

    // Извличане на времеви слотове за конкретен треньор и период
    getTimeSlotsByTrainerAndDateRange: async (trainerId: number, startDate: string, endDate: string): Promise<TimeSlot[]> => {
        try {
            const response = await fetch(
                `${API_URL}/time-slots/trainer/${trainerId}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
                createAuthenticatedRequest('GET')
            );

            if (!response.ok) {
                await handleHttpError(response, 'Неуспешно извличане на времеви слотове');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при извличане на времеви слотове за треньор и период:', error);
            throw error;
        }
    },

    // Извличане на конкретен времеви слот по ID
    getTimeSlotById: async (id: number): Promise<TimeSlot> => {
        try {
            const response = await fetch(
                `${API_URL}/time-slots/${id}`,
                createAuthenticatedRequest('GET')
            );

            if (!response.ok) {
                await handleHttpError(response, 'Неуспешно извличане на времеви слот');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при извличане на времеви слот:', error);
            throw error;
        }
    },

    // Създаване на нов времеви слот
    createTimeSlot: async (data: Partial<TimeSlot>): Promise<TimeSlot> => {
        try {
            const response = await fetch(
                `${API_URL}/time-slots`,
                createAuthenticatedRequest('POST', data)
            );

            if (!response.ok) {
                await handleHttpError(response, 'Неуспешно създаване на времеви слот');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при създаване на времеви слот:', error);
            throw error;
        }
    },

    // Отмяна на времеви слот
    cancelTimeSlot: async (id: number): Promise<TimeSlot> => {
        try {
            const response = await fetch(
                `${API_URL}/time-slots/${id}/cancel`,
                createAuthenticatedRequest('PUT')
            );

            if (!response.ok) {
                await handleHttpError(response, 'Неуспешна отмяна на времеви слот');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при отмяна на времеви слот:', error);
            throw error;
        }
    },

    // Извличане на клиенти за конкретен времеви слот
    getClientsForTimeSlot: async (timeSlotId: number): Promise<BookedClientInfo[]> => {
        try {
            const response = await fetch(
                `${API_URL}/time-slots/${timeSlotId}/clients`,
                createAuthenticatedRequest('GET')
            );

            if (!response.ok) {
                await handleHttpError(response, 'Неуспешно извличане на информация за клиенти');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при извличане на информация за клиенти:', error);
            throw error;
        }
    }
};