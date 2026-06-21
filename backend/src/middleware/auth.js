/**
 * Module: backend/src/middleware/auth.js
 * Utilite: Definit la logique backend de cette fonctionnalite BerserkerCut.
 * Navigation: Commencer par les exports publics (routes, modeles, services).
 */
const jwt = require('jsonwebtoken');

/**
 * Fonction: requireAuth
 * Utilite: Execute une partie de la logique backend/metier.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = {
  requireAuth,
};
