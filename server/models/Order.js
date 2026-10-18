const mongoose = require('mongoose');
const crypto = require('crypto');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['placed', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required']
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    pickupAddress: {
      address: {
        type: String,
        required: [true, 'Pickup address description is required']
      },
      lat: {
        type: Number,
        required: [true, 'Pickup latitude is required']
      },
      lng: {
        type: Number,
        required: [true, 'Pickup longitude is required']
      }
    },
    dropAddress: {
      address: {
        type: String,
        required: [true, 'Drop address description is required']
      },
      lat: {
        type: Number,
        required: [true, 'Drop latitude is required']
      },
      lng: {
        type: Number,
        required: [true, 'Drop longitude is required']
      }
    },
    packageDetails: {
      description: {
        type: String,
        default: 'Standard Package'
      },
      weight: {
        type: Number,
        default: 1.0
      },
      dimensions: {
        type: String,
        default: 'Medium'
      }
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed'
    },
    statusHistory: [statusHistorySchema],
    estimatedDelivery: {
      type: Date
    },
    actualDelivery: {
      type: Date,
      default: null
    },
    currentLocation: {
      lat: {
        type: Number,
        default: null
      },
      lng: {
        type: Number,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: auto-generate trackingId if new, and push initial status to statusHistory
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    if (!this.trackingId) {
      const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
      this.trackingId = `DT${randomHex}`;
    }

    if (!this.statusHistory || this.statusHistory.length === 0) {
      this.statusHistory = [
        {
          status: this.status || 'placed',
          timestamp: new Date(),
          note: 'Order successfully placed'
        }
      ];
    }

    if (this.pickupAddress && (!this.currentLocation || this.currentLocation.lat == null)) {
      this.currentLocation = {
        lat: this.pickupAddress.lat,
        lng: this.pickupAddress.lng
      };
    }
  }

  next();
});

module.exports = mongoose.model('Order', orderSchema);
