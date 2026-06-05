import mongoose, { Schema, Document, Model } from 'mongoose';

// ===== Notification =====
export type NotificationType =
  | 'TRIP_REMINDER'
  | 'BUDGET_ALERT'
  | 'FLIGHT_ALERT'
  | 'SYSTEM_ALERT'
  | 'ADMIN_ANNOUNCEMENT'
  | 'BOOKING_CONFIRMED'
  | 'TICKET_UPDATE'
  | 'COMMUNITY_LIKE'
  | 'COMMUNITY_COMMENT'
  | 'AI_READY';

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: [
      'TRIP_REMINDER', 'BUDGET_ALERT', 'FLIGHT_ALERT',
      'SYSTEM_ALERT', 'ADMIN_ANNOUNCEMENT', 'BOOKING_CONFIRMED',
      'TICKET_UPDATE', 'COMMUNITY_LIKE', 'COMMUNITY_COMMENT', 'AI_READY',
    ],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  actionUrl: String,
}, { timestamps: true });

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90 day TTL

// ===== Audit Log =====
export interface IAuditLog extends Document {
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  statusCode?: number;
  duration?: number;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String, index: true },
  userEmail: String,
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: String,
  details: { type: Schema.Types.Mixed },
  ipAddress: String,
  userAgent: String,
  statusCode: Number,
  duration: Number,
}, { timestamps: { createdAt: true, updatedAt: false } });

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, resource: 1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 }); // 1 year TTL

// ===== Search History =====
export interface ISearchHistory extends Document {
  userId: string;
  query: string;
  type: 'destinations' | 'trips' | 'activities' | 'packages' | 'cities' | 'global';
  resultCount: number;
  createdAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>({
  userId: { type: String, required: true, index: true },
  query: { type: String, required: true },
  type: {
    type: String,
    enum: ['destinations', 'trips', 'activities', 'packages', 'cities', 'global'],
    default: 'global',
  },
  resultCount: { type: Number, default: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } });

SearchHistorySchema.index({ userId: 1, createdAt: -1 });
SearchHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // 30 day TTL

// ===== User Behavior =====
export interface IUserBehavior extends Document {
  userId: string;
  sessionId: string;
  events: {
    type: string;
    data?: Record<string, unknown>;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserBehaviorSchema = new Schema<IUserBehavior>({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  events: [{
    type: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

UserBehaviorSchema.index({ userId: 1, createdAt: -1 });

// ===== AI Recommendation =====
export interface IAiRecommendation extends Document {
  userId: string;
  type: 'destination' | 'activity' | 'package' | 'route';
  recommendations: {
    id: string;
    name: string;
    reason: string;
    score: number;
    metadata?: Record<string, unknown>;
  }[];
  context?: Record<string, unknown>;
  aiModel: string;
  createdAt: Date;
  updatedAt: Date;
}

const AiRecommendationSchema = new Schema<IAiRecommendation>({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['destination', 'activity', 'package', 'route'], required: true },
  recommendations: [{
    id: String,
    name: String,
    reason: String,
    score: Number,
    metadata: { type: Schema.Types.Mixed },
  }],
  context: { type: Schema.Types.Mixed },
  aiModel: { type: String, default: 'gemini' },
}, { timestamps: true });

AiRecommendationSchema.index({ userId: 1, type: 1, createdAt: -1 });
AiRecommendationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }); // 7 day TTL

// ===== Exports =====
export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export const SearchHistory: Model<ISearchHistory> =
  mongoose.models.SearchHistory || mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);

export const UserBehavior: Model<IUserBehavior> =
  mongoose.models.UserBehavior || mongoose.model<IUserBehavior>('UserBehavior', UserBehaviorSchema);

export const AiRecommendation: Model<IAiRecommendation> =
  mongoose.models.AiRecommendation || mongoose.model<IAiRecommendation>('AiRecommendation', AiRecommendationSchema);
