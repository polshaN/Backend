/**
 * Adoption Service Tests – MongoDB fully mocked (TypeScript-safe)
 * File: src/test/Adoption.service.test.ts
 */

import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { ObjectId } from 'mongodb';
import { adoptionService } from '../services/adoption.service';
import mongo from '../database/mongo';

// Silence console logs during tests
beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
});

/* -------------------------------------------------------------------------- */
/*                               MongoDB Mock                                 */
/* -------------------------------------------------------------------------- */

type CollectionMock = {
    findOne: vi.Mock;
    insertOne?: vi.Mock;
    find?: vi.Mock;
    findOneAndUpdate?: vi.Mock;
    deleteOne?: vi.Mock;
};

const collections: Record<string, CollectionMock> = {
    adoptions: {
        findOne: vi.fn(),
        find: vi.fn(),
        insertOne: vi.fn(),
        findOneAndUpdate: vi.fn(),
        deleteOne: vi.fn(),
    },
    users: {
        findOne: vi.fn(),
        insertOne: vi.fn(),
    },
    animals: {
        findOne: vi.fn(),
    },
};

vi.mock('../database/mongo', () => ({
    default: {
        db: {
            collection: (name: string) => collections[name],
        },
    },
}));

const getCollection = (name: keyof typeof collections) =>
    collections[name];

/* -------------------------------------------------------------------------- */
/*                                   Tests                                    */
/* -------------------------------------------------------------------------- */

describe('AdoptionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* --------------------------- getUserAdoptions ---------------------------- */
    describe('getUserAdoptions', () => {
        it('returns user adoptions with enriched data', async () => {
            const userEmail = 'john@example.com';
            const userId = new ObjectId();
            const animalId = new ObjectId();

            (getCollection('users').findOne as vi.Mock).mockResolvedValue({
                _id: userId,
                firstName: 'John',
                lastName: 'Doe',
                email: userEmail,
            });

            (getCollection('adoptions').find as vi.Mock).mockReturnValue({
                toArray: vi.fn().mockResolvedValue([
                    {
                        _id: new ObjectId(),
                        userId,
                        animalId,
                        status: 'pending_request',
                        requestTime: new Date(),
                    },
                ]),
            });

            (getCollection('animals').findOne as vi.Mock).mockResolvedValue({
                _id: animalId,
                name: 'Bella',
                type: 'Dog',
            });

            const result = await adoptionService.getUserAdoptions(userEmail);

            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('userName');
            expect(result[0]).toHaveProperty('animalName');
        });

        it('returns empty array if user not found', async () => {
            (getCollection('users').findOne as vi.Mock).mockResolvedValue(null);

            const result = await adoptionService.getUserAdoptions('nope@mail.com');
            expect(result).toEqual([]);
        });

        it('throws if database fails', async () => {
            (getCollection('users').findOne as vi.Mock).mockRejectedValue(new Error('DB error'));
            await expect(
                adoptionService.getUserAdoptions('fail@mail.com')
            ).rejects.toThrow('DB error');
        });
    });

    /* ----------------------------- getAllAdoptions ---------------------------- */
    describe('getAllAdoptions', () => {
        it('returns all adoptions with user and animal data', async () => {
            const userId = new ObjectId();
            const animalId = new ObjectId();

            (getCollection('adoptions').find as vi.Mock).mockReturnValue({
                toArray: vi.fn().mockResolvedValue([
                    {
                        _id: new ObjectId(),
                        userId,
                        animalId,
                        status: 'approved',
                        requestTime: new Date(),
                    },
                ]),
            });

            (getCollection('users').findOne as vi.Mock).mockResolvedValue({
                _id: userId,
                firstName: 'Jane',
                lastName: 'Doe',
            });

            (getCollection('animals').findOne as vi.Mock).mockResolvedValue({
                _id: animalId,
                name: 'Mittens',
            });

            const result = await adoptionService.getAllAdoptions();
            expect(result).toHaveLength(1);
        });

        it('handles missing related documents', async () => {
            (getCollection('adoptions').find as vi.Mock).mockReturnValue({
                toArray: vi.fn().mockResolvedValue([
                    {
                        _id: new ObjectId(),
                        userId: new ObjectId(),
                        animalId: new ObjectId(),
                        status: 'pending_request',
                        requestTime: new Date(),
                    },
                ]),
            });

            (getCollection('users').findOne as vi.Mock).mockResolvedValue(null);
            (getCollection('animals').findOne as vi.Mock).mockResolvedValue(null);

            const result = await adoptionService.getAllAdoptions();
            expect(result).toHaveLength(1);
        });
    });

    /* -------------------------- createAdoptionRequest ------------------------- */
    describe('createAdoptionRequest', () => {
        it('creates adoption for existing user', async () => {
            const userEmail = 'john@example.com';
            const animalId = new ObjectId();

            (getCollection('users').findOne as vi.Mock).mockResolvedValue({
                _id: new ObjectId(),
                email: userEmail,
            });
            (getCollection('animals').findOne as vi.Mock).mockResolvedValue({
                _id: animalId,
                name: 'Bella',
            });
            (getCollection('adoptions').findOne as vi.Mock).mockResolvedValue(null);
            (getCollection('adoptions').insertOne as vi.Mock).mockResolvedValue({
                insertedId: new ObjectId(),
            });

            const result = await adoptionService.createAdoptionRequest(userEmail, animalId.toString());
            expect(result.status).toBe('pending_request');
        });

        it('creates user if not exists', async () => {
            (getCollection('users').findOne as vi.Mock).mockResolvedValue(null);
            (getCollection('users').insertOne as vi.Mock).mockResolvedValue({
                insertedId: new ObjectId(),
            });
            (getCollection('animals').findOne as vi.Mock).mockResolvedValue({
                _id: new ObjectId(),
                name: 'Bella',
            });
            (getCollection('adoptions').findOne as vi.Mock).mockResolvedValue(null);
            (getCollection('adoptions').insertOne as vi.Mock).mockResolvedValue({
                insertedId: new ObjectId(),
            });

            const result = await adoptionService.createAdoptionRequest('new@mail.com', new ObjectId().toString());
            expect(result).toBeDefined();
            expect(getCollection('users').insertOne).toHaveBeenCalled();
        });

        it('throws if animal not found', async () => {
            (getCollection('users').findOne as vi.Mock).mockResolvedValue({ _id: new ObjectId() });
            (getCollection('animals').findOne as vi.Mock).mockResolvedValue(null);

            await expect(
                adoptionService.createAdoptionRequest('john@mail.com', new ObjectId().toString())
            ).rejects.toThrow('Animal not found');
        });
    });

    /* --------------------------- updateAdoptionStatus -------------------------- */
    describe('updateAdoptionStatus', () => {
        it('updates status to approved', async () => {
            (getCollection('adoptions').findOneAndUpdate as vi.Mock).mockResolvedValue({
                value: {
                    _id: new ObjectId(),
                    status: 'approved',
                },
            });

            const result = await adoptionService.updateAdoptionStatus(new ObjectId().toString(), 'approved');
            expect(result.status).toBe('approved');
        });

        it('throws on update error', async () => {
            (getCollection('adoptions').findOneAndUpdate as vi.Mock).mockRejectedValue(new Error('DB error'));

            await expect(
                adoptionService.updateAdoptionStatus(new ObjectId().toString(), 'approved')
            ).rejects.toThrow();
        });
    });

    /* ------------------------------- deleteAdoption ---------------------------- */
    describe('deleteAdoption', () => {
        it('deletes adoption', async () => {
            (getCollection('adoptions').deleteOne as vi.Mock).mockResolvedValue({
                deletedCount: 1,
            });

            const result = await adoptionService.deleteAdoption(new ObjectId().toString());
            expect(result.deletedCount).toBe(1);
        });
    });
});
