import { controlTests } from "./data.js";

export const getAllControlTestsText = () => {
  const summary = controlTests
    .map(test => `- ${test.controlArea} (${test.id}) | Status: ${test.testStatus} | Owner: ${test.owner}`)
    .join("\n");

  return `Guided assurance control tests:\n${summary}`;
};

export const getControlTestStatusSummaryText = () => {
  const counts = controlTests.reduce<Record<string, number>>((result, test) => {
    result[test.testStatus] = (result[test.testStatus] ?? 0) + 1;
    return result;
  }, {});

  return `Guided assurance summary:\n- Not Started: ${counts["Not Started"] ?? 0}\n- In Progress: ${counts["In Progress"] ?? 0}\n- Passed: ${counts["Passed"] ?? 0}\n- Failed: ${counts["Failed"] ?? 0}`;
};

export const getTestsByOwnerText = (ownerName: string) => {
  const matches = controlTests.filter(test => test.owner.toLowerCase() === ownerName.toLowerCase());
  if (matches.length === 0) {
    return `No control tests found for owner ${ownerName}.`;
  }

  const summary = matches
    .map(test => `- ${test.controlArea} (${test.id}) | Status: ${test.testStatus}`)
    .join("\n");

  return `Control tests owned by ${ownerName}:\n${summary}`;
};