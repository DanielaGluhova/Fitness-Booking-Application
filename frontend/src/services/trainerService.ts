// src/services/trainerService.ts
import {API_URL, getToken} from "./api.ts";

export interface TrainerProfile {
    id: number;
    userId: number;
    fullName: string;
    email: string;
    phone: string;
    bio: string;
    specializations: string[];
    personalPrice: number;
    groupPrice: number;
}

export const TrainerService = {
    getTrainerProfile: async (trainerId?: number): Promise<TrainerProfile> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            // Ако trainerId не е предоставен, вземаме профила на текущия треньор
            const endpoint = trainerId
                ? `${API_URL}/trainers/${trainerId}`
                : `${API_URL}/trainers/profile`;

            const response = await fetch(endpoint, {
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
                throw new Error('Неуспешно извличане на профила на треньора');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при извличане на профила на треньора:', error);
            throw error;
        }
    },

    updateTrainerProfile: async (id: number, data: Partial<TrainerProfile>): Promise<TrainerProfile> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const response = await fetch(`${API_URL}/trainers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Нямате права за достъп или сесията е изтекла');
                }
                throw new Error('Неуспешно обновяване на профила на треньора');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при обновяване на профила на треньора:', error);
            throw error;
        }
    },

    // Функция за извличане на всички треньори (може да се използва от клиентската част на приложението)
    getAllTrainers: async (): Promise<TrainerProfile[]> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const response = await fetch(`${API_URL}/trainers`, {
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
                throw new Error('Неуспешно извличане на списъка с треньори');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при извличане на списъка с треньори:', error);
            throw error;
        }
    },
};