import { Request, Response } from "express";
import { adoptionService } from "../../services/adoption.service";
import { userService } from "../../services/user.service";

export class ProfileController {
    async getUserProfile(req: Request, res: Response) {
        try {
            // Get user email from extracted JWT
            const userEmail = (req as any).userEmail;

            console.log(`[Profile] Loading profile for: ${userEmail}`);

            if (!userEmail) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User email not found in token'
                });
            }

            // Get user info
            let user = await userService.users_collection.findOne({ email: userEmail });

            // If user doesn't exist, create them
            if (!user) {
                console.log(`[Profile] User not found, creating: ${userEmail}`);
                const newUser = {
                    firstName: userEmail.split('@')[0],
                    lastName: '',
                    email: userEmail,
                    phone: null,
                    telegramUsername: null,
                    adoptionPoints: 0,
                    role: 'user',
                    avatar: null
                };
                const result = await userService.users_collection.insertOne(newUser);
                user = { _id: result.insertedId, ...newUser };
            }

            // Get user's adoptions
            const adoptions = await adoptionService.getUserAdoptions(userEmail);

            res.json({
                user: {
                    _id: user._id?.toString?.() || user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    adoptionPoints: user.adoptionPoints,
                    avatar: user.avatar
                },
                adoptions: adoptions,
                adoptionCount: adoptions.length
            });
        } catch (error: any) {
            console.error('[Profile] Error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}