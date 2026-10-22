const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cors = require('cors');
const connectDB = require('./config/db');
const Contact = require('./contact');
const User = require('./user');
const authenticate = require('./middleware/authenticate');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in the backend environment.');
}

if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be set in the backend environment.');
}

connectDB();

app.use(cors());
app.use(express.json());

const createToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

app.post('/api/auth/signup', async (req, res) => {
    try {
        const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = req.body.password;

        if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ message: 'Enter your name, a valid email, and a password of at least 8 characters.' });
        }

        const user = await User.create({ name, email, password });
        return res.status(201).json({ token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Please enter valid account details.' });
        }
        return res.status(500).json({ message: 'Unable to create your account right now.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = req.body.password;
        const user = await User.findOne({ email }).select('+password');

        if (!user || typeof password !== 'string' || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Incorrect email or password.' });
        }

        return res.status(200).json({ token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
    } catch {
        return res.status(500).json({ message: 'Unable to log in right now.' });
    }
});

// All contact operations require a verified account.
app.use('/api/contacts', authenticate);

app.post('/api/contacts', async (req, res) => {
    try {
        const { name, email, phone, isFavorite, category } = req.body;
        if ((isFavorite !== undefined && typeof isFavorite !== 'boolean') ||
            (category !== undefined && !Contact.schema.path('category').enumValues.includes(category))) {
            return res.status(400).json({ message: 'Please enter a valid contact category and favorite value.' });
        }
        const contact = await Contact.create({ userId: req.userId, name, email, phone, isFavorite, category });
        return res.status(201).json(contact);
    } catch (error) {
        return res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: 'Unable to create contact.' });
    }
});

app.get('/api/contacts', async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 6));
    const categoryValues = Contact.schema.path('category').enumValues;
    if (category && !categoryValues.includes(category)) {
        return res.status(400).json({ message: 'Please select a valid contact category.' });
    }
    const baseFilter = { userId: req.userId };

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        baseFilter.$or = [
            { name: { $regex: escapedSearch, $options: 'i' } },
            { phone: { $regex: escapedSearch, $options: 'i' } },
            { email: { $regex: escapedSearch, $options: 'i' } }
        ];
    }

    const filter = category
        ? {
            ...baseFilter,
            $and: [
                ...(baseFilter.$and || []),
                category === 'Other'
                    ? { $or: [{ category: 'Other' }, { category: { $exists: false } }] }
                    : { category }
            ]
        }
        : baseFilter;
    const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [contacts, total, totalContacts, recentlyAdded, categoryCounts] = await Promise.all([
        Contact.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
        Contact.countDocuments(filter),
        Contact.countDocuments({ userId: req.userId }),
        Contact.countDocuments({ userId: req.userId, createdAt: { $gte: recentCutoff } }),
        Promise.all(categoryValues.map(async (value) => {
            const categoryFilter = value === 'Other'
                ? { $or: [{ category: 'Other' }, { category: { $exists: false } }] }
                : { category: value };
            return [value, await Contact.countDocuments({ $and: [baseFilter, categoryFilter] })];
        })).then((counts) => Object.fromEntries(counts))
    ]);

    return res.status(200).json({
        contacts,
        total,
        totalContacts,
        recentlyAdded,
        categoryCounts,
        page,
        pages: Math.ceil(total / limit)
    });
});

app.get('/api/contacts/:id', async (req, res) => {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.userId });
    if (!contact) return res.status(404).json({ message: 'Contact not found.' });
    return res.status(200).json(contact);
});

app.put('/api/contacts/:id', async (req, res) => {
    try {
        const { name, email, phone, isFavorite, category } = req.body;
        if ((isFavorite !== undefined && typeof isFavorite !== 'boolean') ||
            (category !== undefined && !Contact.schema.path('category').enumValues.includes(category))) {
            return res.status(400).json({ message: 'Please enter a valid contact category and favorite value.' });
        }
        const updates = { name, email, phone };
        if (isFavorite !== undefined) updates.isFavorite = isFavorite;
        if (category !== undefined) updates.category = category;
        const contact = await Contact.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!contact) return res.status(404).json({ message: 'Contact not found.' });
        return res.status(200).json(contact);
    } catch (error) {
        return res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: 'Unable to update contact.' });
    }
});

app.delete('/api/contacts/:id', async (req, res) => {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!contact) return res.status(404).json({ message: 'Contact not found.' });
    return res.status(200).json({ message: 'Contact deleted successfully', contact });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
})