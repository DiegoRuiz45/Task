const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'super_secreto';

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Token faltante.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido.' });
  }
};

const requireAdmin = (req, res, next) => {
  console.log("Rol del usuario:", req.user?.role); // 👀
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado (solo admin)' });
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
};
