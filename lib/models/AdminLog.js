import mongoose from 'mongoose';

/**
 * Every meaningful admin/staff action is logged here.
 * Used by the super-admin activity log viewer.
 */
const AdminLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, default: '' }, // snapshot

    action: { type: String, required: true, index: true }, // e.g. 'product.create'
    entityType: { type: String, default: '' }, // e.g. 'Product'
    entityId: { type: String, default: '' },

    details: { type: mongoose.Schema.Types.Mixed, default: null },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

AdminLogSchema.index({ createdAt: -1 });

export default mongoose.models.AdminLog || mongoose.model('AdminLog', AdminLogSchema);
