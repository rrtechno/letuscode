/**
 * LessonValidatorEngine
 * Pure, execution-agnostic evaluator. Takes a lesson's `testCases[]` and a
 * *normalized* execution result — { stdout, stderr, error, variables } —
 * the same shape every track's Execution Adapter must return per
 * /docs/execution-adapter-contract.md. This module never imports Pyodide
 * or anything track-specific, so it's fully unit-testable with mock
 * results and works unmodified for future tracks.
 *
 * Supported testCase.type values:
 *   "stdout-equals"    { expected: string }
 *   "stdout-contains"  { expected: string }
 *   "variable-equals"  { variableName: string, expected: any }
 */
export const LessonValidatorEngine = {
  /**
   * @param {object} lesson
   * @param {{stdout:string, stderr:string, error:object|null, variables:object}} executionResult
   * @returns {{passed:boolean, results: Array<{testId:string, passed:boolean, message:string}>}}
   */
  evaluate(lesson, executionResult) {
    const results = (lesson.testCases || []).map((tc) => evaluateOne(tc, executionResult));
    const passed = results.length > 0 && results.every((r) => r.passed);
    return { passed, results };
  }
};

function evaluateOne(testCase, result) {
  if (result.error) {
    return {
      testId: testCase.id,
      passed: false,
      message: testCase.failureMessage || 'Your code ran into an error before it could finish.'
    };
  }

  switch (testCase.type) {
    case 'stdout-equals': {
      const actual = (result.stdout || '').trim();
      const expected = String(testCase.expected).trim();
      const passed = actual === expected;
      return {
        testId: testCase.id,
        passed,
        message: passed
          ? testCase.successMessage || 'Nice — that output is exactly right!'
          : testCase.failureMessage || `Expected the output to be "${expected}".`
      };
    }
    case 'stdout-contains': {
      const actual = result.stdout || '';
      const passed = actual.includes(testCase.expected);
      return {
        testId: testCase.id,
        passed,
        message: passed
          ? testCase.successMessage || 'Found what we were looking for!'
          : testCase.failureMessage || `Expected the output to include "${testCase.expected}".`
      };
    }
    case 'variable-equals': {
      const actual = result.variables ? result.variables[testCase.variableName] : undefined;
      // eslint-disable-next-line eqeqeq
      const passed = actual !== undefined && jsonEquals(actual, testCase.expected);
      return {
        testId: testCase.id,
        passed,
        message: passed
          ? testCase.successMessage || `"${testCase.variableName}" has the right value!`
          : testCase.failureMessage || `Expected "${testCase.variableName}" to equal ${JSON.stringify(testCase.expected)}.`
      };
    }
    default:
      return { testId: testCase.id, passed: false, message: `Unknown test case type "${testCase.type}"` };
  }
}

function jsonEquals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
