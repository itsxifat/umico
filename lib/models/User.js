import mongoose from 'mongoose';
import { ROLE_VALUES, ROLES, PERMISSION_VALUES } from '../permissions.js';

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, default: '' },
    postcode: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' }, // local upload path

    // Auth
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null, index: true },
    emailVerified: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 }, // bump to force logout everywhere

    // Role & permissions
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.CUSTOMER,
      index: true,
    },
    permissions: {
      type: [{ type: String, enum: PERMISSION_VALUES }],
      default: [],
    },
    permissionGroups: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PermissionGroup' }],
      default: [],
    },

    // Account status
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'timeout'],
      default: 'active',
      index: true,
    },
    timeoutUntil: { type: Date, default: null },
    banReason: { type: String, default: '' },

    // Segmentation
    tags: { type: [String], default: [] },

    // Addresses
    addresses: { type: [AddressSchema], default: [] },

    // Wishlist (array of product IDs)
    wishlist: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      default: [],
    },

    // Dashboard layout preference (for admins)
    dashboardLayout: { type: mongoose.Schema.Types.Mixed, default: null },

    // Notification preferences
    notificationPrefs: {
      newOrder: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      newReturn: { type: Boolean, default: true },
      newCustomer: { type: Boolean, default: false },
      contactMessage: { type: Boolean, default: true },
    },

    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
