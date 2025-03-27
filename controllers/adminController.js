const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Toilet = require('../models/Toilet');
const Review = require('../models/Review');
const QRCode = require('qrcode');

// Admin Authentication
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Create new admin (password will be hashed by the model's pre-save hook)
        const admin = new Admin({
            email,
            password
        });

        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt - Email:', email);
        console.log('Request body:', JSON.stringify(req.body));

        if (!email || !password) {
            console.log('Missing credentials - Email:', !!email, 'Password:', !!password);
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find admin - use case-insensitive email comparison
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        console.log('Admin lookup result:', admin ? 'Found' : 'Not found');
        
        if (!admin) {
            console.log('No admin account found for email:', email);
            return res.status(400).json({ message: 'No account found with this email' });
        }

        console.log('Stored hashed password:', admin.password);
        console.log('Attempting password comparison...');

        // Verify password using bcrypt directly
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Password comparison result:', isMatch ? 'Match' : 'No match');

        if (!isMatch) {
            console.log('Password verification failed for email:', email);
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Generate JWT token with a consistent secret
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        console.log('Using JWT secret:', JWT_SECRET.substring(0, 3) + '...');

        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful - Generated token for:', email);
        
        return res.json({ 
            success: true,
            message: 'Login successful',
            token,
            email: admin.email
        });
    } catch (error) {
        console.error('Login error details:', error);
        return res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Toilet Management
exports.addToilet = async (req, res) => {
    try {
        console.log('Add toilet request received:', req.body);
        const { name, location, description, coordinates, facilities } = req.body;

        // Validate required fields
        if (!name || !location || !coordinates) {
            console.log('Missing required fields:', { name: !!name, location: !!location, coordinates: !!coordinates });
            return res.status(400).json({ message: 'Name, location, and coordinates are required' });
        }

        // Validate coordinates
        if (!coordinates.latitude || !coordinates.longitude) {
            console.log('Invalid coordinates:', coordinates);
            return res.status(400).json({ message: 'Valid latitude and longitude are required' });
        }

        // Create new toilet with validation
        const toilet = new Toilet({
            name: name.trim(),
            location: location.trim(),
            description: description ? description.trim() : '',
            coordinates: {
                latitude: parseFloat(coordinates.latitude),
                longitude: parseFloat(coordinates.longitude)
            },
            facilities: Array.isArray(facilities) ? facilities : [],
            isActive: true
        });

        console.log('Creating toilet with data:', toilet);

        // Save the toilet
        await toilet.save();
        console.log('Toilet saved successfully with ID:', toilet._id);

        // Generate QR code with just the toilet ID
        const qrData = toilet._id.toString();
        const qrCode = await QRCode.toDataURL(qrData);

        // Update toilet with QR code
        toilet.qrCode = qrCode;
        await toilet.save();

        console.log('QR code generated and saved');

        res.status(201).json({
            success: true,
            message: 'Toilet added successfully',
            toilet: {
                ...toilet.toObject(),
                qrCode: qrCode
            }
        });
    } catch (error) {
        console.error('Add toilet error:', error);
        res.status(500).json({ 
            message: 'Failed to add toilet',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateToilet = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, description, coordinates, facilities } = req.body;

        const toilet = await Toilet.findByIdAndUpdate(
            id,
            { name, location, description, coordinates, facilities },
            { new: true }
        );

        if (!toilet) {
            return res.status(404).json({ message: 'Toilet not found' });
        }

        res.json(toilet);
    } catch (error) {
        console.error('Update toilet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteToilet = async (req, res) => {
    try {
        const { id } = req.params;

        const toilet = await Toilet.findByIdAndDelete(id);
        if (!toilet) {
            return res.status(404).json({ message: 'Toilet not found' });
        }

        // Delete associated reviews
        await Review.deleteMany({ toiletId: id });

        res.json({ message: 'Toilet deleted successfully' });
    } catch (error) {
        console.error('Delete toilet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Review Management
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('toiletId', 'name location')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 