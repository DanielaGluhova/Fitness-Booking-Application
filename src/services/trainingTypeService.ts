import {API_URL, getToken} from "./api.ts";

export enum TrainingTypeCategory {
    PERSONAL = "PERSONAL",
    GROUP = "GROUP"
}

export interface TrainingType {
    id: number;
    name: string;
    description: string;
    duration: number; // в минути
    category: TrainingTypeCategory;
    maxClients: number | null;
}

export const TrainingTypeService = {
    getAllTrainingTypes: async (): Promise<TrainingType[]> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const response = await fetch(`${API_URL}/training-types`, {
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
                throw new Error('Неуспешно извличане на типове тренировки');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при извличане на типове тренировки:', error);
            throw error;
        }
    },

    createTrainingType: async (data: Partial<TrainingType>): Promise<TrainingType> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const response = await fetch(`${API_URL}/training-types`, {
                method: 'POST',
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
                throw new Error('Неуспешно създаване на тип тренировка');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при създаване на тип тренировка:', error);
            throw error;
        }
    },

    updateTrainingType: async (id: number, data: Partial<TrainingType>): Promise<TrainingType> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const response = await fetch(`${API_URL}/training-types/${id}`, {
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
                throw new Error(`Неуспешно актуализиране на тип тренировка с ID ${id}`);
            }

            return await response.json();
        } catch (error: unknown) {
            console.error(`Грешка при актуализиране на тип тренировка (ID: ${id}):`, error);
            throw error;
        }
    },

    deleteTrainingType: async (id: number): Promise<void> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const response = await fetch(`${API_URL}/training-types/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Нямате права за достъп или сесията е изтекла');
                }
                throw new Error(`Неуспешно изтриване на тип тренировка с ID ${id}`);
            }
        } catch (error: unknown) {
            console.error(`Грешка при изтриване на тип тренировка (ID: ${id}):`, error);
            throw error;
        }
    }
};