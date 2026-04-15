import mongoose from 'mongoose';

const SearchLogSchema = new mongoose.Schema(
  {
    query: { type: String, required: true, trim: true, index: true },
    normalizedQuery: { type: String, required: true, lowercase: true, index: true },
    resultsCount: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

SearchLogSchema.index({ createdAt: -1 });
SearchLogSchema.index({ resultsCount: 1, createdAt: -1 });

export default mongoose.models.SearchLog ||
  mongoose.model('SearchLog', SearchLogSchema);
