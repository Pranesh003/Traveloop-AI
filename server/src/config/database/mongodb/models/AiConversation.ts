import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
}

export interface IAiConversation extends Document {
  userId: string;
  tripId?: string;
  agentType: 'trip_planner' | 'budget' | 'packing' | 'weather' | 'destination' | 'assistant';
  aiModel: string;
  title?: string;
  messages: IMessage[];
  memory?: Record<string, unknown>;
  isArchived: boolean;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  tokens: { type: Number },
}, { _id: false });

const AiConversationSchema = new Schema<IAiConversation>({
  userId: { type: String, required: true, index: true },
  tripId: { type: String, index: true },
  agentType: {
    type: String,
    enum: ['trip_planner', 'budget', 'packing', 'weather', 'destination', 'assistant'],
    default: 'assistant',
  },
  aiModel: { type: String, required: true, default: 'gemini' },
  title: { type: String },
  messages: [MessageSchema],
  memory: { type: Schema.Types.Mixed },
  isArchived: { type: Boolean, default: false },
  totalTokens: { type: Number, default: 0 },
}, { timestamps: true });

AiConversationSchema.index({ userId: 1, createdAt: -1 });
AiConversationSchema.index({ tripId: 1 });

export const AiConversation: Model<IAiConversation> =
  mongoose.models.AiConversation ||
  mongoose.model<IAiConversation>('AiConversation', AiConversationSchema);
