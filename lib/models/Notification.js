import mongoose from 'mongoose';

/**
 * In-app admin notifications (bell icon dropdown).
 * Separate from customer email notifications.
 */
const NotificationSchema = new mongoose.Schema(
  {
    // Recipient admin/staff user. If null, it's a global notification
    // shown to all admins/staff with the given role.
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: [
        'new_order',
        'low_stock',
        'out_of_stock',
        'new_return',
        'new_customer',
        'contact_message',
        'abandoned_cart',
        'new_review',
        'system',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    link: { type: String, default: '' }, // where the bell click should navigate

    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },

    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model('Notification', NotificationSchema);
