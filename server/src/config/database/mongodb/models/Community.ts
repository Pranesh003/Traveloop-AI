import mongoose, { Schema, Document, Model } from 'mongoose';

// ===== Community Post =====
export interface IPost extends Document {
  userId: string;
  content: string;
  images: string[];
  tags: string[];
  likes: string[];
  likeCount: number;
  commentCount: number;
  isPublished: boolean;
  isDeleted: boolean;
  reports: { userId: string; reason: string; createdAt: Date }[];
  visibility: 'public' | 'friends' | 'private';
  tripId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  userId: { type: String, required: true, index: true },
  content: { type: String, required: true, maxlength: 5000 },
  images: [{ type: String }],
  tags: [{ type: String }],
  likes: [{ type: String }],
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  reports: [{
    userId: String,
    reason: String,
    createdAt: { type: Date, default: Date.now },
  }],
  visibility: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
  tripId: { type: String },
}, { timestamps: true });

PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ content: 'text', tags: 'text' });
PostSchema.index({ isPublished: 1, isDeleted: 1, createdAt: -1 });

// ===== Comment =====
export interface IComment extends Document {
  postId: string;
  userId: string;
  content: string;
  likes: string[];
  likeCount: number;
  parentId?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  postId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  content: { type: String, required: true, maxlength: 2000 },
  likes: [{ type: String }],
  likeCount: { type: Number, default: 0 },
  parentId: { type: String },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

CommentSchema.index({ postId: 1, createdAt: -1 });

// ===== Journal =====
export interface IJournalEntry {
  date: Date;
  title?: string;
  content: string;
  images: string[];
  mood?: string;
  weather?: string;
  location?: string;
  createdAt: Date;
}

export interface ITravelJournal extends Document {
  userId: string;
  tripId?: string;
  title: string;
  description?: string;
  coverImage?: string;
  entries: IJournalEntry[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>({
  date: { type: Date, required: true },
  title: String,
  content: { type: String, required: true },
  images: [String],
  mood: String,
  weather: String,
  location: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const TravelJournalSchema = new Schema<ITravelJournal>({
  userId: { type: String, required: true, index: true },
  tripId: { type: String, index: true },
  title: { type: String, required: true },
  description: String,
  coverImage: String,
  entries: [JournalEntrySchema],
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

export const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export const TravelJournal: Model<ITravelJournal> =
  mongoose.models.TravelJournal || mongoose.model<ITravelJournal>('TravelJournal', TravelJournalSchema);
