// src/models/Notification.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    source: string;
    topic: string;
    content: any;
    isRead: boolean;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
    source: { type: String, required: true, default: 'shopify' },
    topic: { type: String, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    isRead: { type: Boolean, default: false },
    userId: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', NotificationSchema);