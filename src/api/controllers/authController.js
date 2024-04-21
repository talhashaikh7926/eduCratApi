const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

exports.signUp = async (req, res, next) => {
    try {
        const { email, username, password, role } = req.body;
       
        const newUser = await User.create({ email, username, password, role:"admin" });

        // Generate a token
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: newUser,
            },
        });
    } catch (error) {
        if (error.name === 'MongoServerError' && error.code === 11000) {
            return res.status(409).json({
                status: 'error',
                message: `A user with the username or Email '${req.body.username}' already exists.`
            });
        }
       
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { usernameOrEmail, password } = req.body;

        const user = await User.findOne({ 
            $or: [
                {email: usernameOrEmail},
                {username: usernameOrEmail}
            ]

        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Incorrect Credentials!');
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        res.status(200).json({
            status: 'success',
            token,
            id: user._id,
            role: user.role 
        });
    } catch (error) {
        next(error);
    }
};
