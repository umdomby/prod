"use client";

import { useState } from 'react';
import { adminHeroesControl } from '@/app/actions';

export default function AdminControlForm({ initialValues }: { initialValues: { globalStop: boolean, stopP2P: boolean, stopTransferPoints: boolean, stopGameUserCreate: boolean } }) {
    const [globalStop, setGlobalStop] = useState(initialValues.globalStop);
    const [stopP2P, setStopP2P] = useState(initialValues.stopP2P);
    const [stopTransferPoints, setStopTransferPoints] = useState(initialValues.stopTransferPoints);
    const [stopGameUserCreate, setStopGameUserCreate] = useState(initialValues.stopGameUserCreate);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await adminHeroesControl(globalStop, stopP2P, stopTransferPoints, stopGameUserCreate);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000); // Скрыть сообщение через 3 секунды
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
                <div className="flex justify-between items-center w-full mb-4">
                    <label className="flex-1 text-center">
                        Global Stop
                    </label>
                    <input
                        type="checkbox"
                        checked={globalStop}
                        onChange={() => setGlobalStop(!globalStop)}
                        className="flex-1"
                    />
                </div>
                <div className="flex justify-between items-center w-full mb-4">
                    <label className="flex-1 text-center">
                        Stop P2P Trade
                    </label>
                    <input
                        type="checkbox"
                        checked={stopP2P}
                        onChange={() => setStopP2P(!stopP2P)}
                        className="flex-1"
                    />
                </div>
                <div className="flex justify-between items-center w-full mb-4">
                    <label className="flex-1 text-center">
                        Stop Transfer Points
                    </label>
                    <input
                        type="checkbox"
                        checked={stopTransferPoints}
                        onChange={() => setStopTransferPoints(!stopTransferPoints)}
                        className="flex-1"
                    />
                </div>
                <div className="flex justify-between items-center w-full mb-4">
                    <label className="flex-1 text-center">
                        Stop Game User Create
                    </label>
                    <input
                        type="checkbox"
                        checked={stopGameUserCreate}
                        onChange={() => setStopGameUserCreate(!stopGameUserCreate)}
                        className="flex-1"
                    />
                </div>
                <button type="submit" className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
                    Сохранить изменения
                </button>
            </form>

            {showSuccessMessage && (
                <div className="mt-4 bg-green-500 text-white py-2 px-4 rounded">
                    Изменения успешно сохранены!
                </div>
            )}
        </div>
    );
}