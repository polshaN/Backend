import mongoose from 'mongoose';
import {HealthStatus} from "./models/animal.model";

const MONGO_URL = process.env.MONGO_URL || 'mongodb://admin:admin@mongo:27017/petdb?authSource=admin';

async function seed() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('✅ Connected to MongoDB');

        // Get the collection
        const collection = mongoose.connection.collection('animals') as any;

        // Clear existing animals
        await collection.deleteMany({});
        console.log('🗑️  Cleared existing animals');

        // Insert test animals
        const animals = [
            {
                name: 'Max',
                type: 'Dog',
                breed: 'Golden Retriever',
                age: 3,
                health_status: HealthStatus.healthy,
                adoption_status: HealthStatus.healthy,
                is_adopted: false,
                description: 'Friendly and energetic golden retriever',
            },
            {
                name: 'Luna',
                type: 'Cat',
                breed: 'Siamese',
                age: 2,
                health_status: HealthStatus.vaccinated,
                adoption_status: HealthStatus.healthy,
                is_adopted: false,
                description: 'Playful and affectionate siamese cat',
            },
            {
                name: 'Charlie',
                type: 'Dog',
                breed: 'Labrador',
                age: 4,
                health_status: HealthStatus.healthy,
                adoption_status: HealthStatus.healthy,
                is_adopted: false,
                description: 'Loyal and gentle labrador',
            },
        ];

        const result = await collection.insertMany(animals);
        console.log(`✅ Seeded ${result.insertedCount} animals`);

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();