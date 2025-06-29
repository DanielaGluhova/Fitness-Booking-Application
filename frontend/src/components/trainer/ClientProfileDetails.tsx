// src/components/trainer/ClientProfileDetails.tsx
import React from 'react';
import { BookedClientInfo } from '../../services/timeSlotService';
import { format, parseISO } from 'date-fns';
import { bg } from 'date-fns/locale';

interface ClientProfileDetailsProps {
    client: BookedClientInfo;
    onClose: () => void;
}

const ClientProfileDetails: React.FC<ClientProfileDetailsProps> = ({ client, onClose }) => {
    const formatBirthDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return format(parseISO(dateString), 'dd MMMM yyyy', { locale: bg });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-800 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Информация за клиент</h3>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-300 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-6">
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Основна информация</h4>
                    <div className="space-y-2">
                        <div className="flex">
                            <span className="font-medium text-gray-600 w-32">Име:</span>
                            <span className="text-black">{client.fullName}</span>
                        </div>
                        <div className="flex">
                            <span className="font-medium text-gray-600 w-32">Имейл:</span>
                            <span className="text-black">{client.email}</span>
                        </div>
                        {client.phone && (
                            <div className="flex">
                                <span className="font-medium text-gray-600 w-32">Телефон:</span>
                                <span className="text-black">{client.phone}</span>
                            </div>
                        )}
                        {client.dateOfBirth && (
                            <div className="flex">
                                <span className="font-medium text-gray-600 w-32">Дата на раждане:</span>
                                <span className="text-black">{formatBirthDate(client.dateOfBirth)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {(client.healthInformation || client.fitnessGoals) && (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Допълнителна информация</h4>

                        {client.healthInformation && (
                            <div className="mb-4">
                                <h5 className="font-medium text-gray-600 mb-1">Здравна информация:</h5>
                                <p className="text-black bg-gray-50 p-3 rounded border border-gray-200">
                                    {client.healthInformation}
                                </p>
                            </div>
                        )}

                        {client.fitnessGoals && (
                            <div>
                                <h5 className="font-medium text-gray-600 mb-1">Фитнес цели:</h5>
                                <p className="text-black bg-gray-50 p-3 rounded border border-gray-200">
                                    {client.fitnessGoals}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientProfileDetails;