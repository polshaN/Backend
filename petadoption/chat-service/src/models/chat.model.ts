import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

let db: Db;

export const connectDB = async (mongoUrl: string) => {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db();
  console.log('✅ Connected to Chat Service MongoDB');
  return db;
};

export const getDB = () => db;

export interface ChatMessage {
  _id?: ObjectId;
  roomId: ObjectId;
  senderId: string;
  content?: string;
  imageUrl?: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatRoom {
  _id?: ObjectId;
  participants: string[];
  messages: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

let messagesCollection: Collection<ChatMessage>;
let roomsCollection: Collection<ChatRoom>;

export function initChatCollections(db: Db) {
  messagesCollection = db.collection<ChatMessage>('messages');
  roomsCollection = db.collection<ChatRoom>('rooms');
}

export function getMessagesCollection(): Collection<ChatMessage> {
  if (!messagesCollection) throw new Error('Messages collection not initialized');
  return messagesCollection;
}

export function getRoomsCollection(): Collection<ChatRoom> {
  if (!roomsCollection) throw new Error('Rooms collection not initialized');
  return roomsCollection;
}