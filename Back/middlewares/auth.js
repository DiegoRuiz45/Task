const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'super_secreto';

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'No autorizado. Token faltante.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // guarda el usuario decodificado en la request
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido.' });
  }
};
