const { sanitizeDateFields } = require('./defaults');

function toClientUser(userDoc) {
  if (!userDoc) return null;
  const plain = userDoc.toJSON({ getters: true });

  const safeUser = {
    id: plain.id || plain._id?.toString(),
    email: plain.email,
    profile: sanitizeDateFields(plain.profile),
    createdAt: plain.createdAt instanceof Date ? plain.createdAt.toISOString() : plain.createdAt,
    updatedAt: plain.updatedAt instanceof Date ? plain.updatedAt.toISOString() : plain.updatedAt,
  };

  return safeUser;
}

module.exports = {
  toClientUser,
};
