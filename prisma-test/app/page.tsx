'use client'; // Обязательно для использования хуков useState и useEffect

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [deviceIds, setDeviceIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDeviceIds() {
      try {
        // Делаем запрос к нашему API
        const response = await fetch('/api/devices');
        if (!response.ok) {
          throw new Error('Ошибка сети при загрузке данных');
        }
        const data = await response.json();
        setDeviceIds(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDeviceIds();
  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз

  return (
      <main style={{ padding: '2rem' }}>
        <h1>ID Разрешенных Устройств</h1>
        {loading && <p>Загрузка...</p>}
        {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}
        {!loading && !error && (
            <ul>
              {deviceIds.length > 0 ? (
                  deviceIds.map((id) => <li key={id}>{id}</li>)
              ) : (
                  <p>Устройства не найдены.</p>
              )}
            </ul>
        )}
      </main>
  );
}