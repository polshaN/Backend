import mongo from "../database/mongo";
import { ObjectId } from "mongodb";

export const adoptionService = {
    get adoptions_collection() {
        if (!mongo.db) throw new Error("DB not initialized");
        return mongo.db.collection("adoptions");
    },

    get users_collection() {
        if (!mongo.db) throw new Error("DB not initialized");
        return mongo.db.collection("users");
    },

    get animals_collection() {
        if (!mongo.db) throw new Error("DB not initialized");
        return mongo.db.collection("animals");
    },

    async getUserAdoptions(userEmail: string) {
        try {
            // First find user by email to get their ObjectId
            const user = await this.users_collection.findOne({ email: userEmail });

            if (!user) {
                console.log(`User not found: ${userEmail}`);
                return [];
            }

            console.log(`Looking up adoptions for userId: ${user._id}`);

            // Then find all adoptions for this user
            const adoptions = await this.adoptions_collection
                .find({ userId: new ObjectId(user._id) })
                .toArray();

            console.log(`Found ${adoptions.length} adoptions for user ${userEmail}`);

            // Enrich with animal details
            const enrichedAdoptions = await Promise.all(
                adoptions.map(async (adoption) => {
                    const animal = await this.animals_collection.findOne({ _id: new ObjectId(adoption.animalId) });
                    const user = await this.users_collection.findOne({ _id: new ObjectId(adoption.userId) });

                    return {
                        _id: adoption._id,
                        userId: adoption.userId,
                        userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
                        userEmail: user?.email || "Unknown",
                        animalId: adoption.animalId,
                        status: adoption.status,
                        requestTime: adoption.requestTime,
                        approvalTime: adoption.approvalTime,
                        rejectionTime: adoption.rejectionTime,
                        cancelledTime: adoption.cancelledTime,
                        scheduledTime: adoption.scheduledTime || null,
                        animalName: animal?.name || "Unknown",
                        animalType: animal?.type || "Unknown",
                        animalBreed: animal?.breed || "Unknown",
                        animalAge: animal?.age || 0,
                        notes: adoption.notes || ""
                    };
                })
            );

            return enrichedAdoptions;
        } catch (error) {
            console.error("Error in getUserAdoptions:", error);
            throw error;
        }
    },

    async getAllAdoptions() {
        try {
            const adoptions = await this.adoptions_collection.find().toArray();

            const enriched = await Promise.all(
                adoptions.map(async (adoption) => {
                    let animal = null;
                    let user = null;

                    try {
                        // Only create ObjectId if needed
                        if (adoption.animalId) {
                            const animalId =
                                typeof adoption.animalId === "string" && ObjectId.isValid(adoption.animalId)
                                    ? new ObjectId(adoption.animalId)
                                    : adoption.animalId; // could already be ObjectId
                            animal = await this.animals_collection.findOne({ _id: animalId });
                        }

                        if (adoption.userId) {
                            const userId =
                                typeof adoption.userId === "string" && ObjectId.isValid(adoption.userId)
                                    ? new ObjectId(adoption.userId)
                                    : adoption.userId;
                            user = await this.users_collection.findOne({ _id: userId });
                        }
                    } catch (err) {
                        console.error("Error fetching related data for adoption:", adoption._id, err);
                    }

                    return {
                        ...adoption,
                        animalName: animal?.name || "Unknown",
                        animalType: animal?.type || "Unknown",
                        animalBreed: animal?.breed || "Unknown",
                        userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
                        userEmail: user?.email || "Unknown",
                    };
                })
            );

            return enriched;
        } catch (error) {
            console.error("Error in getAllAdoptions:", error);
            throw error;
        }
    },
    async createAdoptionRequest(userEmail: string, animalId: string) {
        try {
            let user = await this.users_collection.findOne({ email: userEmail });

            if (!user) {
                console.log(`User not found, creating new user: ${userEmail}`);
                const newUser = {
                    firstName: userEmail.split('@')[0],
                    lastName: '',
                    email: userEmail,
                    phone: null,
                    telegramUsername: null,
                    adoptionPoints: 0,
                    role: 'user',
                    photo: null
                };
                const result = await this.users_collection.insertOne(newUser);
                user = { _id: result.insertedId, ...newUser };
                console.log(`Created new user: ${user._id}`);
            }

            // Check if animal exists
            const animal = await this.animals_collection.findOne({ _id: new ObjectId(animalId) });
            if (!animal) throw new Error(`Animal not found: ${animalId}`);

            // Check if user already requested this animal
            const existingRequest = await this.adoptions_collection.findOne({
                userId: new ObjectId(user._id),
                animalId: new ObjectId(animalId),
                status: { $in: ["pending_request", "scheduled"] }
            });

            if (existingRequest) throw new Error("You already have a pending adoption request for this animal");

            // Create adoption request with correct status
            const adoption = {
                userId: new ObjectId(user._id),
                animalId: new ObjectId(animalId),
                status: "pending_request",
                requestTime: new Date(),
                approvalTime: null,
                rejectionTime: null,
                cancelledTime: null,
                scheduledTime: null
            };

            const result = await this.adoptions_collection.insertOne(adoption);

            return {
                _id: result.insertedId,
                ...adoption
            };
        } catch (error) {
            console.error("Error creating adoption request:", error);
            throw error;
        }
    },

    async updateAdoptionStatus(adoptionId: string, status: string, extraFields: any = {}) {
        try {
            const update: any = { status, ...extraFields };

            if (status === "approved") update.approvalTime = new Date();
            else if (status === "rejected") update.rejectionTime = new Date();
            else if (status === "cancelled") update.cancelledTime = new Date();
            else if (status === "scheduled") update.scheduledTime = extraFields.interviewTime || null;

            const result = await this.adoptions_collection.findOneAndUpdate(
                { _id: new ObjectId(adoptionId) },
                { $set: update },
                { returnDocument: "after" }
            );

            return result.value;
        } catch (error) {
            console.error("Error updating adoption status:", error);
            throw error;
        }
    },

    async deleteAdoption(adoptionId: string) {
        return this.adoptions_collection.deleteOne({ _id: new ObjectId(adoptionId) });
    }
};