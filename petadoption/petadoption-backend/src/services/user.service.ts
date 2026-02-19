import mongo from "../database/mongo";
import { ObjectId } from "mongodb";
import { UserDto } from "../types/dto/user.dto";

export const userService = {
    get users_collection() {
        if (!mongo.db) throw new Error("DB not initialized");
        return mongo.db.collection("users");
    },

    async getAll() {
        return this.users_collection.find().toArray();
    },

    async getById(id: string) {
        return this.users_collection.findOne({ _id: new ObjectId(id) });
    },

    async create(data: UserDto & { keycloakId?: string }) {
        const toInsert: any = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || null,
            telegramUsername: data.telegramUsername || null,
            adoptionPoints: data.adoptionPoints || 0,
            role: 'user',
            photo: data.photo || null
        };

        if (data.keycloakId) toInsert.keycloakId = data.keycloakId;

        const res = await this.users_collection.insertOne(toInsert);
        return { _id: res.insertedId.toString(), ...toInsert };
    },

    async update(id: string, data: UserDto) {
        // prevent keycloakId override
        const { keycloakId, ...safeData } = data;

        const result = await this.users_collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: safeData },
            { returnDocument: "after" }
        );
        return (result.value) ?? null;
    },

    async delete(id: string) {
        return this.users_collection.deleteOne({ _id: new ObjectId(id) });
    },

    async searchByName(query: string) {
        const regex = new RegExp(query, "i");
        return this.users_collection.find({
            $or: [{ firstName: regex }, { lastName: regex }]
        }).toArray();
    },

    async getOrCreateByKeycloak(keycloakUser: any) {
        if (!keycloakUser) return null;
        const keycloakId = keycloakUser.sub || keycloakUser.id || keycloakUser.subject;
        if (!keycloakId) return null;

        let user = await this.users_collection.findOne({ keycloakId });
        if (user) return user;

        const newUser = {
            firstName: keycloakUser.given_name || keycloakUser.firstName || "User",
            lastName: keycloakUser.family_name || keycloakUser.lastName || "",
            email: keycloakUser.email || `${keycloakId}@keycloak.local`,
            phone: null,
            telegramUsername: null,
            adoptionPoints: 0,
            keycloakId,
            role: "user",
            photo: keycloakUser.picture || null
        };

        const res = await this.users_collection.insertOne(newUser);
        return { _id: res.insertedId.toString(), ...newUser };
    }
};
