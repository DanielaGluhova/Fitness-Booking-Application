// src/components/client/TrainerCard.tsx
import React from 'react';
import {TrainerProfile} from "../../services/trainerService.ts";

interface TrainerCardProps {
    trainer: TrainerProfile;
    onViewDetails: () => void;
}

const TrainerCard: React.FC<TrainerCardProps> = ({ trainer, onViewDetails }) => {
    return (
        <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{trainer.fullName}</h3>

                {trainer.specializations && trainer.specializations.length > 0 && (
                    <div className="mb-4">
                        <div className="text-sm font-medium text-gray-600 mb-1">Специализации:</div>
                        <div className="flex flex-wrap gap-1">
                            {trainer.specializations.map((spec, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-1">Цени:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white p-2 rounded border">
                            <span className="font-medium text-gray-700">Персонални:</span>
                            <span className="ml-1 text-green-700 font-semibold">{trainer.personalPrice} лв.</span>
                        </div>
                        <div className="bg-white p-2 rounded border">
                            <span className="font-medium text-gray-700">Групови:</span>
                            <span className="ml-1 text-green-700 font-semibold">{trainer.groupPrice} лв.</span>
                        </div>
                    </div>
                </div>

                {trainer.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {trainer.bio}
                    </p>
                )}

                <div className="flex justify-end mt-2">
                    <button
                        onClick={onViewDetails}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                    >
                        Повече детайли
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrainerCard;