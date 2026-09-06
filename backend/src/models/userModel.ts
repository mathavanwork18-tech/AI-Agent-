import { MongoClient, Db, Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage.js';

export interface UserDocument {
  _id: string;
  name: string;
  mobile: string;
  createdAt: string;
  lastSeenAt: string;
}

export class UserModel {
  private static client: MongoClient | null = null;
  private static db: Db | null = null;
  private static usersCollection: Collection<UserDocument> | null = null;
  private static mongoConnected = false;
  private static lastConnectAttempt = 0;

  private static async getCollection(): Promise<Collection<UserDocument> | null> {
    if (this.usersCollection && this.mongoConnected) return this.usersCollection;

    // Retry connection after 10 seconds if previously disconnected
    const now = Date.now();
    if (!this.mongoConnected && now - this.lastConnectAttempt < 10000) {
      return null;
    }
    this.lastConnectAttempt = now;

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agentheal';

    if (mongoUri.includes('<db_username>') || mongoUri.includes('%3Cdb_username%3E')) {
      console.log('⚠️  MONGODB_URI contains placeholder "<db_username>". Please replace with your Atlas database username in backend/.env');
      return null;
    }

    try {
      const client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000
      });
      await client.connect();
      this.client = client;
      this.db = client.db('agentheal');
      this.usersCollection = this.db.collection<UserDocument>('users');
      this.mongoConnected = true;
      console.log('📦 Connected to MongoDB (database: agentheal, collection: users)');
      return this.usersCollection;
    } catch (err: any) {
      this.mongoConnected = false;
      console.log('ℹ️  MongoDB not reachable (' + err.message + '). Seamlessly persisting users via storage engine.');
      return null;
    }
  }

  /**
   * Validate user input fields
   */
  public static validateInput(name: string, mobile: string): { valid: boolean; reason?: string } {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return { valid: false, reason: 'Please enter a valid name (at least 2 characters).' };
    }

    if (name.trim().length > 60) {
      return { valid: false, reason: 'Name is too long (maximum 60 characters).' };
    }

    if (!mobile || typeof mobile !== 'string') {
      return { valid: false, reason: 'Please enter a valid mobile number.' };
    }

    // Normalized digits only check
    const digitsOnly = mobile.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return { valid: false, reason: 'Mobile number must contain 10 to 15 digits.' };
    }

    return { valid: true };
  }

  /**
   * Onboard or authenticate user via MongoDB insertOne
   */
  public static async onboardUser(name: string, mobile: string): Promise<UserDocument> {
    const trimmedName = name.trim();
    const cleanMobile = mobile.trim();
    const now = new Date().toISOString();

    const collection = await this.getCollection();

    if (collection) {
      try {
        // Check if user with this mobile already exists to prevent duplicates
        const existing = await collection.findOne({ mobile: cleanMobile });
        if (existing) {
          await collection.updateOne(
            { _id: existing._id },
            { $set: { lastSeenAt: now, name: trimmedName } }
          );
          return {
            ...existing,
            name: trimmedName,
            lastSeenAt: now
          };
        }

        const newUser: UserDocument = {
          _id: uuidv4(),
          name: trimmedName,
          mobile: cleanMobile,
          createdAt: now,
          lastSeenAt: now
        };

        await collection.insertOne(newUser);
        return newUser;
      } catch (mongoErr) {
        console.warn('MongoDB insert error, using storage fallback:', mongoErr);
      }
    }

    // Storage fallback with identical MongoDB schema
    return storage.saveUser({
      name: trimmedName,
      mobile: cleanMobile,
      createdAt: now,
      lastSeenAt: now
    });
  }

  /**
   * Retrieve safe user session
   */
  public static async getUserById(userId: string): Promise<UserDocument | null> {
    const collection = await this.getCollection();
    if (collection) {
      try {
        const found = await collection.findOne({ _id: userId });
        if (found) return found;
      } catch (e) {
        // fallback to storage
      }
    }
    return storage.getUserById(userId);
  }
}
