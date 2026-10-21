const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) return res.status(401).json({ message: 'Authentication required.' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (typeof payload !== 'object' || typeof payload.userId !== 'string') {
            return res.status(401).json({ message: 'Invalid or expired access token.' });
        }
        req.userId = payload.userId;
        return next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired access token.' });
    }
};

module.exports = authenticate;