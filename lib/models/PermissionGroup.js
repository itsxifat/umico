import mongoose from 'mongoose';
import { PERMISSION_VALUES } from '../permissions.js';

/**
 * PermissionGroup — a named bundle of permissions that can be
 * assigned to staff members (e.g. "Content Manager" =
 * content.edit + products.view).
 */
const PermissionGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    permissions: {
      type: [{ type: String, enum: PERMISSION_VALUES }],
      default: [],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.PermissionGroup ||
  mongoose.model('PermissionGroup', PermissionGroupSchema);
