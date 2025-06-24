const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto123';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // cambia a true si usas HTTPS
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 día
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    const user = await userService.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: '1d',
    });

    res
        .cookie('token', token, COOKIE_OPTIONS)
        .json({ message: 'Login exitoso', user: { id: user.id, username: user.username, role: user.role } });
};

exports.logout = (req, res) => {
    res.clearCookie('token').json({ message: 'Logout exitoso' });
};

exports.getMe = (req, res) => {
    res.json({ user: req.user });
};
