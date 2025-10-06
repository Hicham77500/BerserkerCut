function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeDeep(target = {}, source = {}) {
  const output = { ...target };

  if (!isObject(source)) {
    return source !== undefined ? source : output;
  }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = output[key];

    if (Array.isArray(sourceValue)) {
      output[key] = [...sourceValue];
    } else if (isObject(sourceValue)) {
      output[key] = mergeDeep(isObject(targetValue) ? targetValue : {}, sourceValue);
    } else if (sourceValue !== undefined) {
      output[key] = sourceValue;
    }
  });

  return output;
}

module.exports = {
  mergeDeep,
};
