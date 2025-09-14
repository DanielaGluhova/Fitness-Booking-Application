export const API_URL = 'http://localhost:8080/api';

// Помощна функция за извличане на токена
export const getToken = (): string | null => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        const user = JSON.parse(userStr);
        return user.token || null;
    } catch (e) {
        console.error('Грешка при извличане на токена:', e);
        return null;
    }
};

// Помощна функция за обработка на HTTP грешки
export const handleHttpError = async (response: Response, defaultMessage: string): Promise<never> => {
    if (response.status === 401 || response.status === 403) {
        throw new Error('Нямате права за достъп или сесията е изтекла');
    }

    if (response.status === 404) {
        throw new Error('Ресурсът не е намерен');
    }

    let errorMessage = defaultMessage;
    try {
        const errorData = await response.json();

        if (errorData.fieldErrors) {
            const fieldErrorMessages = Object.values(errorData.fieldErrors)
                .map((message) => `${message}`)
                .join(', ');
            errorMessage = fieldErrorMessages;
        } else if (errorData.message) {
            errorMessage = errorData.message;
        } else if (errorData.error) {
            errorMessage = errorData.error;
        }
    } catch {
        // Ако не можем да парсираме JSON, използваме текста
        try {
            const errorText = await response.text();
            if (errorText) {
                errorMessage = errorText;
            }
        } catch {
            //
        }
    }

    throw new Error(errorMessage);
};