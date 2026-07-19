/**
 * validateLesson
 * Checks a lesson object has the required fields with correct basic
 * types. This is intentionally a hand-rolled, dependency-free check (no
 * build tools means no JSON-schema library import) rather than a full
 * JSON-Schema implementation. Returns { valid, errors[] } — never throws,
 * so callers can decide how to react (Lesson Engine logs + surfaces a
 * friendly error; content QA tooling can fail a CI check on `!valid`).
 */
export function validateLesson(lesson, sourceId = 'unknown') {
  const errors = [];

  function requireField(field, type) {
    const value = lesson[field];
    if (value === undefined || value === null) {
      errors.push(`Lesson "${sourceId}": missing required field "${field}"`);
      return;
    }
    if (type === 'array' && !Array.isArray(value)) {
      errors.push(`Lesson "${sourceId}": field "${field}" must be an array`);
    } else if (type !== 'array' && typeof value !== type) {
      errors.push(`Lesson "${sourceId}": field "${field}" must be of type ${type}`);
    }
  }

  requireField('id', 'string');
  requireField('title', 'string');
  requireField('moduleId', 'string');
  requireField('order', 'number');
  requireField('contentBlocks', 'array');
  requireField('starterCode', 'string');
  requireField('testCases', 'array');

  if (Array.isArray(lesson.contentBlocks)) {
    lesson.contentBlocks.forEach((block, i) => {
      if (!block.type) errors.push(`Lesson "${sourceId}": contentBlocks[${i}] missing "type"`);
    });
  }

  if (Array.isArray(lesson.testCases)) {
    lesson.testCases.forEach((tc, i) => {
      if (!tc.id) errors.push(`Lesson "${sourceId}": testCases[${i}] missing "id"`);
      if (!tc.type) errors.push(`Lesson "${sourceId}": testCases[${i}] missing "type"`);
    });
  }

  return { valid: errors.length === 0, errors };
}
