import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'free_shipping'],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },

    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: 0 }, // cap for percentage

    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usagePerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },

    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, default: null },

    applicableTo: {
      type: {
        type: String,
        enum: ['all', 'specific_products', 'specific_categories', 'specific_brands'],
        default: 'all',
      },
      ids: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
      index: true,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
