import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

let db: Db;

export const connectDB = async (mongoUrl: string) => {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db();
  console.log('✅ Connected to Profile Service MongoDB');
  return db;
};

export const getDB = () => db;

export interface UserProfile {
  _id?: ObjectId;
  userId: string;
  username: string;
  avatar?: string;
  preferences?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export const getProfilesCollection = (): Collection<UserProfile> => {
  return db.collection('profiles');
};
