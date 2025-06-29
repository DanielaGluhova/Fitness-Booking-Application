
// src/components/client/TrainerDetailsModal.tsx
import React from 'react';
import {TrainerProfile} from "../../services/trainerService.ts";

interface TrainerDetailsModalProps {
    trainer: TrainerProfile;
    onClose: () => void;
}

const TrainerDetailsModal: React.FC<TrainerDetailsModalProps> = ({ trainer, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center rounded-t-lg">
                    <h3 className="text-xl font-bold">Профил на треньор</h3>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-black mb-4">Основна информация</h4>
                        <div className="space-y-2">
                            <div className="flex">
                                <span className="font-medium text-gray-600 w-32">Име:</span>
                                <span className="text-black">{trainer.fullName}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium text-gray-600 w-32">Имейл:</span>
                                <span className="text-black">{trainer.email}</span>
                            </div>
                            {trainer.phone && (
                                <div className="flex">
                                    <span className="font-medium text-gray-600 w-32">Телефон:</span>
                                    <span className="text-black">{trainer.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {trainer.bio && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-black mb-2">Биография</h4>
                            <p className="text-black bg-gray-50 p-3 rounded border border-gray-200">
                                {trainer.bio}
                            </p>
                        </div>
                    )}

                    {trainer.specializations && trainer.specializations.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-black mb-2">Специализации</h4>
                            <div className="flex flex-wrap gap-2">
                                {trainer.specializations.map((specialization, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        {specialization}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <h4 className="text-lg font-semibold text-black mb-2">Цени</h4>
                        <div className="space-y-2">
                            <div className="flex">
                                <span className="font-medium text-gray-600 w-44">Персонални тренировки:</span>
                                <span className="text-black font-semibold">{trainer.personalPrice} лв.</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium text-gray-600 w-44">Групови тренировки:</span>
                                <span className="text-black font-semibold">{trainer.groupPrice} лв.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDetailsModal;