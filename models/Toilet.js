const mongoose = require('mongoose');

const toiletSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  qrCode: {
    type: String
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  facilities: [{
    type: String,
    enum: ['handicap', 'baby_change', 'shower', 'bidet', 'paper_towel', 'hand_dryer']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual for formatted address
toiletSchema.virtual('formattedAddress').get(function() {
  return `${this.location} (${this.coordinates.latitude}, ${this.coordinates.longitude})`;
});

// Method to update average rating
toiletSchema.methods.updateRating = async function() {
  const reviews = await mongoose.model('Review').find({ toiletId: this._id });
  if (reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  this.averageRating = totalRating / reviews.length;
  this.totalReviews = reviews.length;
  await this.save();
};

module.exports = mongoose.model('Toilet', toiletSchema); 