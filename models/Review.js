const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  toilet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Toilet',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  cleanliness: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  maintenance: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  accessibility: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  photos: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: props => `${props.value} is not a valid image URL!`
    }
  }],
  helpful: {
    type: Number,
    default: 0
  },
  reported: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate average rating virtual
reviewSchema.virtual('averageRating').get(function() {
  return (this.cleanliness + this.maintenance + this.accessibility) / 3;
});

// Index for faster queries
reviewSchema.index({ toilet: 1, createdAt: -1 });

// Pre-save middleware to update toilet rating
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Toilet = mongoose.model('Toilet');
    const toilet = await Toilet.findById(this.toilet);
    if (toilet) {
      const allReviews = await this.constructor.find({ toilet: this.toilet });
      const totalRating = allReviews.reduce((sum, review) => sum + review.averageRating, 0);
      toilet.averageRating = (totalRating + this.averageRating) / (allReviews.length + 1);
      toilet.totalReviews = allReviews.length + 1;
      await toilet.save();
    }
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema); 