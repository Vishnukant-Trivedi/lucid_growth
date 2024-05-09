import mongoose, { Schema, Document } from 'mongoose';
export interface IContact {
    id?: number;
    phoneNumber: string;
    email: string;
    slackId?: mongoose.Types.ObjectId;
    slackChannelId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}