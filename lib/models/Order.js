import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // Snapshot fields (so historical orders stay accurate if product changes)
    productName: { type: String, required: true },
    variantLabel: { type: String, default: '' },
    productImage: { type: String, default: '' },
    sku: { type: String, default: '' },

    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ShippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, default: '' },
    postcode: { type: String, default: '' },
  },
  { _id: false }
);

const DeliveryUpdateSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    source: {
      type: String,
      enum: ['steadfast_webhook', 'manual', 'system'],
      default: 'system',
    },
  },
  { _id: false }
);

const ReturnRequestSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected', 'received', 'refunded'],
      default: 'none',
    },
    reason: { type: String, default: '' },
    photos: { type: [String], default: [] }, // local upload paths
    requestedAt: { type: Date, default: null },
    processedAt: { type: Date, default: null },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    refundAmount: { type: Number, default: 0 },
    adminNote: { type: String, default: '' },
    customerNote: { type: String, default: '' },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // Format: UMICO-YYYYMMDD-NNNN
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    items: { type: [OrderItemSchema], default: [] },

    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: '' },
    shippingCost: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    shippingAddress: { type: ShippingAddressSchema, required: true },

    deliveryMethod: {
      type: String,
      enum: ['steadfast', 'manual'],
      default: 'steadfast',
    },

    paymentMethod: {
      type: String,
      enum: ['cod', 'online'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },

    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'in_transit',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'pending',
      index: true,
    },

    // Steadfast courier
    steadfastConsignmentId: { type: String, default: '' },
    steadfastTrackingCode: { type: String, default: '' },

    deliveryStatusUpdates: { type: [DeliveryUpdateSchema], default: [] },

    customerNote: { type: String, default: '' },
    adminNote: { type: String, default: '' },

    // Tracking context
    ipAddress: { type: String, default: '' },
    deviceInfo: { type: mongoose.Schema.Types.Mixed, default: null },

    returnRequest: { type: ReturnRequestSchema, default: () => ({}) },

    // For cancelled orders
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: '' },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
