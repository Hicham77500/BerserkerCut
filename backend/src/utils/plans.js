function sanitizePlan(planDoc) {
  if (!planDoc) return null;

  const plain = planDoc.toJSON({ getters: true });

  const plan = {
    ...plain,
    date: plain.date ? new Date(plain.date).toISOString() : null,
    createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : null,
    updatedAt: plain.updatedAt ? new Date(plain.updatedAt).toISOString() : null,
  };

  return plan;
}

function markSupplementTaken(supplementPlan = {}, supplementId) {
  const updatedPlan = JSON.parse(JSON.stringify(supplementPlan || {}));
  let found = false;

  Object.keys(updatedPlan).forEach((period) => {
    const entries = updatedPlan[period];
    if (Array.isArray(entries)) {
      updatedPlan[period] = entries.map((entry) => {
        if (entry && entry.supplementId === supplementId) {
          found = true;
          return { ...entry, taken: true };
        }
        return entry;
      });
    }
  });

  return { updatedPlan, found };
}

module.exports = {
  sanitizePlan,
  markSupplementTaken,
};
