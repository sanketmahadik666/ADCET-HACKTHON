require('dotenv').config();
const mongoose = require('mongoose');
const Toilet = require('../models/Toilet');

const sampleToilets = [
    {
        name: "ADCET Campus Toilet 1",
        location: "Near Main Building",
        description: "Main campus toilet facility",
        coordinates: {
            latitude: 18.5204,
            longitude: 73.8567
        },
        averageRating: 4.5,
        totalReviews: 10,
        facilities: ["handicap", "paper_towel"],
        isActive: true
    },
    {
        name: "ADCET Campus Toilet 2",
        location: "Near Library",
        description: "Library area toilet facility",
        coordinates: {
            latitude: 18.5214,
            longitude: 73.8577
        },
        averageRating: 4.0,
        totalReviews: 8,
        facilities: ["handicap", "hand_dryer"],
        isActive: true
    },
    {
        name: "ADCET Campus Toilet 3",
        location: "Sports Complex",
        description: "Sports area toilet facility",
        coordinates: {
            latitude: 18.5194,
            longitude: 73.8557
        },
        averageRating: 3.5,
        totalReviews: 5,
        facilities: ["shower", "hand_dryer"],
        isActive: true
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/toilet-review', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing toilets
        await Toilet.deleteMany({});
        console.log('Cleared existing toilets');

        // Insert sample toilets
        await Toilet.insertMany(sampleToilets);
        console.log('Sample toilets inserted successfully');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeding function
seedDatabase(); 