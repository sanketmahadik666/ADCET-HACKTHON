const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key'); // Replace with your actual secret key
        req.admin = decoded;
        console.log('Token verified for admin:', decoded.id);
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = {
    authenticateToken
}; 