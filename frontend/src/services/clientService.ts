import {API_URL, getToken} from "./api.ts";

export interface ClientProfile {
    id: number;
    userId: number;
    fullName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    healthInformation?: string;
    fitnessGoals?: string;
}

export const ClientService = {
    getClientProfile: async (clientId: number): Promise<ClientProfile> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const response = await fetch(`${API_URL}/clients/${clientId}`, {
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
                throw new Error('Неуспешно извличане на профила на клиента');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при извличане на профила на клиента:', error);
            throw error;
        }
    },

    updateClientProfile: async (id: number, data: Partial<ClientProfile>): Promise<ClientProfile> => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error('Не сте влезли в системата. Моля, влезте отново.');
            }

            const response = await fetch(`${API_URL}/clients/${id}`, {
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
                throw new Error('Неуспешно обновяване на профила на клиента');
            }

            return await response.json();
        } catch (error: unknown) {
            console.error('Грешка при обновяване на профила на клиента:', error);
            throw error;
        }
    }
};