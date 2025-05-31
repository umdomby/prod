import axios from "axios";

export async function checkVPN(ip: string): Promise<boolean> {
    try {
        const response = await axios.get(`https://v2.api.iphub.info/ip/${ip}`, {
            headers: {
                'X-Key': process.env.IPHUB_API_KEY!, // Ваш api-ключ от IPHub
            },
        });
        return response.data.block === 1; // Если block === 1, то это VPN/прокси
    } catch (error) {
        console.error('Ошибка при проверке VPN:', error);
        return false;
    }
}