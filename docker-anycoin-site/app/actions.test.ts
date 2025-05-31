import { placeBet } from './actions';
import { prisma } from '@/prisma/prisma-client';
import { UserRole, PlayerChoice } from '@prisma/client';

// Моки для Prisma
jest.mock('@/prisma/prisma-client', () => ({
    prisma: {
        bet: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        betParticipant: {
            create: jest.fn(),
        },
        $transaction: jest.fn((fn) => fn()),
    },
}));

describe('placeBet', () => {
    beforeEach(() => {
        // Установите куки перед каждым тестом
        document.cookie = "next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Ty0CPvWUhDHQqDNh.wsaHkyH1lA-BClMSwQGOp-UT4F2dKX1qvDuY4XScDjdOTDxANaqeRdLQ141qdse9Qs5HIEfelXemXx-DivpMvDg7yJ2lFaj0pfDe7r521lDc6tG9XNjFt0nPuWQKPi8VSQNPoPX5rlEETbvR7Qcu5PTkAGAabiFKNeiAkjjWsoJcsdrz5uEPu5kJ-SDN4jAgKh_NU_HdfU0NAFEUW0Wo0OZ4Gigp4D0eBGlxouEYpbHKJDyx5c-n2pNeCBNeAugOoVkHBZvKEuawcEKlTO2l0FUxe5YhuTAJ-V12CBz4DzSHbz3x-ys8xxQK7iHgOdapdNf0w7NeHvvPuMeVfBI29zNYNTv1N9xsosSY2t-HS67F0Y53yE5T4qeJiK2rX6zPfeXku4qFAg8e9g5FMacDs6qHGahCPa-Z4H9dG7vq.0k5ZOK8Gd37qvi1edWrP4A";
    });

    it('should place a bet successfully', async () => {
        // Настройка моков
        const mockBet = {
            id: 1,
            status: 'OPEN',
            suspendedBet: false,
            oddsBetPlayer1: 1.5,
            oddsBetPlayer2: 2.0,
            participants: [],
        };

        const mockUser = {
            id: 1,
            points: 100,
        };

        (prisma.bet.findUnique as jest.Mock).mockResolvedValue(mockBet);
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

        const formData = {
            betId: 1,
            userId: 1,
            userRole: UserRole.USER,
            amount: 10,
            player: PlayerChoice.PLAYER1,
        };

        await expect(placeBet(formData)).resolves.toEqual({ success: true });

        // Проверка вызовов моков
        expect(prisma.betParticipant.create).toHaveBeenCalled();
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { points: 90 },
        });
    });

    it('should throw an error if the bet is not open', async () => {
        const mockBet = {
            id: 1,
            status: 'CLOSED',
        };

        (prisma.bet.findUnique as jest.Mock).mockResolvedValue(mockBet);

        const formData = {
            betId: 1,
            userId: 1,
            userRole: UserRole.USER,
            amount: 10,
            player: PlayerChoice.PLAYER1,
        };

        await expect(placeBet(formData)).rejects.toThrow('Ставка недоступна для участия');
    });

    // Добавьте другие тесты для различных сценариев
});
