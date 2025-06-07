'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ServoState {
    servoAngle: number;
    servo2Angle: number;
    servo1MinAngle: number;
    servo1MaxAngle: number;
    servo2MinAngle: number;
    servo2MaxAngle: number;
    setServoAngle: (angle: number) => void;
    setServo2Angle: (angle: number) => void;
    setServo1MinAngle: (angle: number) => void;
    setServo1MaxAngle: (angle: number) => void;
    setServo2MinAngle: (angle: number) => void;
    setServo2MaxAngle: (angle: number) => void;
}

const ServoContext = createContext<ServoState | undefined>(undefined);

export const ServoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [servoAngle, setServoAngle] = useState(() => {
        const saved = localStorage.getItem('servoAngle');
        return saved ? Number(saved) : 90;
    });
    const [servo2Angle, setServo2Angle] = useState(() => {
        const saved = localStorage.getItem('servo2Angle');
        return saved ? Number(saved) : 90;
    });
    const [servo1MinAngle, setServo1MinAngle] = useState(() => {
        const saved = localStorage.getItem('servo1MinAngle');
        return saved ? Number(saved) : 0;
    });
    const [servo1MaxAngle, setServo1MaxAngle] = useState(() => {
        const saved = localStorage.getItem('servo1MaxAngle');
        return saved ? Number(saved) : 180;
    });
    const [servo2MinAngle, setServo2MinAngle] = useState(() => {
        const saved = localStorage.getItem('servo2MinAngle');
        return saved ? Number(saved) : 0;
    });
    const [servo2MaxAngle, setServo2MaxAngle] = useState(() => {
        const saved = localStorage.getItem('servo2MaxAngle');
        return saved ? Number(saved) : 180;
    });

    useEffect(() => {
        localStorage.setItem('servoAngle', servoAngle.toString());
    }, [servoAngle]);

    useEffect(() => {
        localStorage.setItem('servo2Angle', servo2Angle.toString());
    }, [servo2Angle]);

    useEffect(() => {
        localStorage.setItem('servo1MinAngle', servo1MinAngle.toString());
    }, [servo1MinAngle]);

    useEffect(() => {
        localStorage.setItem('servo1MaxAngle', servo1MaxAngle.toString());
    }, [servo1MaxAngle]);

    useEffect(() => {
        localStorage.setItem('servo2MinAngle', servo2MinAngle.toString());
    }, [servo2MinAngle]);

    useEffect(() => {
        localStorage.setItem('servo2MaxAngle', servo2MaxAngle.toString());
    }, [servo2MaxAngle]);

    return (
        <ServoContext.Provider
            value={{
                servoAngle,
                servo2Angle,
                servo1MinAngle,
                servo1MaxAngle,
                servo2MinAngle,
                servo2MaxAngle,
                setServoAngle,
                setServo2Angle,
                setServo1MinAngle,
                setServo1MaxAngle,
                setServo2MinAngle,
                setServo2MaxAngle,
            }}
        >
            {children}
        </ServoContext.Provider>
    );
};

export const useServo = () => {
    const context = useContext(ServoContext);
    if (!context) {
        throw new Error('useServo must be used within a ServoProvider');
    }
    return context;
};


// Пояснение:
//
//     ServoProvider инициализирует состояния для углов и диапазонов, загружая их из localStorage.
//     useEffect сохраняет каждое значение в localStorage при изменении.
//     useServo — хук для доступа к контексту из других компонентов.