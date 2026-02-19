import { Request, Response } from "express";
import { adoptionService } from "../../services/adoption.service";

export class AdoptionsController {
    async request(req: Request, res: Response) {
        try {
            // Get user email from extracted JWT
            const userEmail = (req as any).userEmail;
            const { animalId } = req.body;

            console.log(`[Adoption Request] User: ${userEmail}, Animal: ${animalId}`);

            if (!userEmail) {
                console.log('[Adoption Request] No user email found');
                return res.status(401).json({
                    status: 'error',
                    message: 'User email not found in token'
                });
            }

            if (!animalId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'animalId is required'
                });
            }

            const adoption = await adoptionService.createAdoptionRequest(userEmail, animalId);

            res.status(201).json(adoption);
        } catch (error: any) {
            console.error('[Adoption Request] Error:', error);
            res.status(error.message?.includes('already') ? 409 : 500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getUserAdoptions(req: Request, res: Response) {
        try {
            const userEmail = (req as any).userEmail;

            if (!userEmail) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User email not found in token'
                });
            }

            const adoptions = await adoptionService.getUserAdoptions(userEmail);
            res.json(adoptions);
        } catch (error: any) {
            console.error('Get user adoptions error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getAllAdoptions(req: Request, res: Response) {
        try {
            console.log('[Adoptions] Getting all adoptions for staff');
            const adoptions = await adoptionService.getAllAdoptions();
            res.json(adoptions);
        } catch (error: any) {
            console.error('Get all adoptions error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async approve(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const adoption = await adoptionService.updateAdoptionStatus(id, "approved");
            res.json(adoption);
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async reject(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const adoption = await adoptionService.updateAdoptionStatus(id, "rejected");
            res.json(adoption);
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async schedule(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { interviewTime, notes } = req.body;

            const adoption = await adoptionService.updateAdoptionStatus(
                id,
                "scheduled",
                { interviewTime: interviewTime ? new Date(interviewTime) : null, notes }
            );

            res.json(adoption);
        } catch (error: any) {
            console.error("Schedule error:", error);
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    async cancel(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const adoption = await adoptionService.updateAdoptionStatus(
                id,
                "cancelled" // or "rejected"
            );

            res.json(adoption);

        } catch (error: any) {
            console.error("Cancel adoption error:", error);
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async deleteAdoption(req: Request, res: Response) {
        try {
            const { id } = req.params;
            console.log(`[Adoption Delete] Deleting adoption: ${id}`);

            const result = await adoptionService.deleteAdoption(id);

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Adoption not found'
                });
            }

            console.log(`[Adoption Delete] Successfully deleted adoption: ${id}`);
            res.status(204).send();
        } catch (error: any) {
            console.error('[Adoption Delete] Error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}