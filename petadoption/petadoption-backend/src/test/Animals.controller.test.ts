import { describe, it, expect, beforeEach, vi } from 'vitest';
import {AdoptionsController} from "../api/controllers/adoption.controller";
import {adoptionService} from "../services/adoption.service";
import mongo from '../database/mongo';


// Mock the adoption service
vi.mock('../../src/services/adoption.service');

describe('AdoptionsController', () => {
    let controller: AdoptionsController;
    let mockRequest: any;
    let mockResponse: any;

    beforeEach(() => {
        controller = new AdoptionsController();

        mockRequest = {
            body: {},
            params: {},
        };

        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        };

        vi.clearAllMocks();
    });

    describe('request', () => {
        it('should create adoption request successfully', async () => {
            const userEmail = 'john@example.com';
            const animalId = 'animal-id-123';
            const adoptionId = 'adoption-id-789';

            mockRequest.userEmail = userEmail;
            mockRequest.body = { animalId };

            const mockAdoption = {
                _id: adoptionId,
                userId: 'user-id-123',
                animalId,
                status: 'pending_request',
                requestTime: new Date(),
            };

            vi.mocked(adoptionService.createAdoptionRequest).mockResolvedValue(mockAdoption);

            await controller.request(mockRequest, mockResponse);

            expect(adoptionService.createAdoptionRequest).toHaveBeenCalledWith(userEmail, animalId);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockAdoption);
        });

        it('should return 401 if user email not found', async () => {
            mockRequest.userEmail = null;
            mockRequest.body = { animalId: 'animal-id-123' };

            await controller.request(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
        });

        it('should return 400 if animalId is missing', async () => {
            mockRequest.userEmail = 'john@example.com';
            mockRequest.body = {};

            await controller.request(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });

        it('should return 409 if user already has pending request', async () => {
            const userEmail = 'john@example.com';
            const animalId = 'animal-id-123';

            mockRequest.userEmail = userEmail;
            mockRequest.body = { animalId };

            const error = new Error('You already have a pending adoption request for this animal');
            vi.mocked(adoptionService.createAdoptionRequest).mockRejectedValue(error);

            await controller.request(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(409);
        });
    });

    describe('getUserAdoptions', () => {
        it('should return user adoptions', async () => {
            const userEmail = 'john@example.com';
            mockRequest.userEmail = userEmail;

            const mockAdoptions = [
                {
                    _id: 'adoption-id-1',
                    userId: 'user-id-123',
                    animalId: 'animal-id-456',
                    status: 'pending_request',
                    animalName: 'Bella',
                    userName: 'John Doe',
                },
                {
                    _id: 'adoption-id-2',
                    userId: 'user-id-123',
                    animalId: 'animal-id-789',
                    status: 'approved',
                    animalName: 'Mittens',
                    userName: 'John Doe',
                },
            ];

            vi.mocked(adoptionService.getUserAdoptions).mockResolvedValue(mockAdoptions);

            await controller.getUserAdoptions(mockRequest, mockResponse);

            expect(adoptionService.getUserAdoptions).toHaveBeenCalledWith(userEmail);
            expect(mockResponse.json).toHaveBeenCalledWith(mockAdoptions);
        });

        it('should return 401 if user email not found', async () => {
            mockRequest.userEmail = null;

            await controller.getUserAdoptions(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
        });
    });

    describe('getAllAdoptions', () => {
        it('should return all adoptions', async () => {
            const mockAdoptions = [
                {
                    _id: 'adoption-id-1',
                    userId: 'user-id-123',
                    animalId: 'animal-id-456',
                    status: 'pending_request',
                    animalName: 'Bella',
                    userName: 'John Doe',
                },
            ];

            vi.mocked(adoptionService.getAllAdoptions).mockResolvedValue(mockAdoptions);

            await controller.getAllAdoptions(mockRequest, mockResponse);

            expect(adoptionService.getAllAdoptions).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith(mockAdoptions);
        });
    });

    describe('approve', () => {
        it('should approve adoption', async () => {
            const adoptionId = 'adoption-id-123';
            mockRequest.params = { id: adoptionId };

            const mockUpdatedAdoption = {
                _id: adoptionId,
                status: 'approved',
                approvalTime: new Date(),
            };

            vi.mocked(adoptionService.updateAdoptionStatus).mockResolvedValue(mockUpdatedAdoption);

            await controller.approve(mockRequest, mockResponse);

            expect(adoptionService.updateAdoptionStatus).toHaveBeenCalledWith(adoptionId, 'approved');
            expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedAdoption);
        });
    });

    describe('reject', () => {
        it('should reject adoption', async () => {
            const adoptionId = 'adoption-id-123';
            mockRequest.params = { id: adoptionId };

            const mockUpdatedAdoption = {
                _id: adoptionId,
                status: 'rejected',
                rejectionTime: new Date(),
            };

            vi.mocked(adoptionService.updateAdoptionStatus).mockResolvedValue(mockUpdatedAdoption);

            await controller.reject(mockRequest, mockResponse);

            expect(adoptionService.updateAdoptionStatus).toHaveBeenCalledWith(adoptionId, 'rejected');
            expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedAdoption);
        });
    });

    describe('schedule', () => {
        it('should schedule adoption interview', async () => {
            const adoptionId = 'adoption-id-123';
            const interviewTime = new Date('2024-02-15T10:00:00Z');

            mockRequest.params = { id: adoptionId };
            mockRequest.body = {
                interviewTime: interviewTime.toISOString(),
                notes: 'Meet at shelter office',
            };

            const mockUpdatedAdoption = {
                _id: adoptionId,
                status: 'scheduled',
                interviewTime,
                notes: 'Meet at shelter office',
            };

            vi.mocked(adoptionService.updateAdoptionStatus).mockResolvedValue(mockUpdatedAdoption);

            await controller.schedule(mockRequest, mockResponse);

            expect(adoptionService.updateAdoptionStatus).toHaveBeenCalledWith(
                adoptionId,
                'scheduled',
                expect.any(Object)
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedAdoption);
        });
    });

    describe('cancel', () => {
        it('should cancel adoption', async () => {
            const adoptionId = 'adoption-id-123';
            mockRequest.params = { id: adoptionId };

            const mockUpdatedAdoption = {
                _id: adoptionId,
                status: 'cancelled',
                cancelledTime: new Date(),
            };

            vi.mocked(adoptionService.updateAdoptionStatus).mockResolvedValue(mockUpdatedAdoption);

            await controller.cancel(mockRequest, mockResponse);

            expect(adoptionService.updateAdoptionStatus).toHaveBeenCalledWith(adoptionId, 'cancelled');
            expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedAdoption);
        });
    });

    describe('deleteAdoption', () => {
        it('should delete adoption successfully', async () => {
            const adoptionId = 'adoption-id-123';
            mockRequest.params = { id: adoptionId };

            vi.mocked(adoptionService.deleteAdoption).mockResolvedValue({
                deletedCount: 1,
            });

            await controller.deleteAdoption(mockRequest, mockResponse);

            expect(adoptionService.deleteAdoption).toHaveBeenCalledWith(adoptionId);
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('should return 404 if adoption not found', async () => {
            const adoptionId = 'nonexistent-id';
            mockRequest.params = { id: adoptionId };

            vi.mocked(adoptionService.deleteAdoption).mockResolvedValue({
                deletedCount: 0,
            });

            await controller.deleteAdoption(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
        });
    });
});