import mongo from "../database/mongo";
import { ObjectId } from "mongodb";
import {AnimalDto} from "../types/dto/animal.dto";
export const animalsService = {
    get animals_collection() {
        if (!mongo.db) throw new Error("DB not initialized");
        return mongo.db.collection("animals");
    },

    async create(data: AnimalDto) {
        const animal = {
            name: data.name,
            type: data.type,
            breed: data.breed,
            age: data.age,
            health_status: data.health_status,
            adoption_status: data.adoption_status,
            photo: data.photo || null
        };
        await this.animals_collection.insertOne(animal);
        return animal;
    },

    async getAll() {
        return this.animals_collection.find().toArray();
    },

    async getById(id: string) {
        return this.animals_collection.findOne({ _id: new ObjectId(id) });
    },

    async update(id: string, data: AnimalDto) {

        return this.animals_collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: data },
            { returnDocument: "after" }
        );
    },

    async delete(id: string) {
        return this.animals_collection.findOneAndDelete({ _id: new ObjectId(id) });
    }
};
