import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 100, // Количество виртуальных пользователей
    duration: '10s', // Продолжительность теста
};

export default function () {
    const res = http.get('https://anycoin.site/api/get-bets4'); // Пример API-запроса
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(1);
}