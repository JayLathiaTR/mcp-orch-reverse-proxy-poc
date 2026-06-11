import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import { controlTests } from "./data.js";

const server = new McpServer({
  name: "guided-assurance-mcp",
  version: "1.0.0",
});

const getAllControlTestsText = () => {
  const summary = controlTests
    .map(test => `- ${test.controlArea} (${test.id}) | Status: ${test.testStatus} | Owner: ${test.owner}`)
    .join("\n");

  return `Guided assurance control tests:\n${summary}`;
};

const getControlTestStatusSummaryText = () => {
  const counts = controlTests.reduce<Record<string, number>>((result, test) => {
    result[test.testStatus] = (result[test.testStatus] ?? 0) + 1;
    return result;
  }, {});

  return `Guided assurance summary:\n- Not Started: ${counts["Not Started"] ?? 0}\n- In Progress: ${counts["In Progress"] ?? 0}\n- Passed: ${counts["Passed"] ?? 0}\n- Failed: ${counts["Failed"] ?? 0}`;
};

const getTestsByOwnerText = (ownerName: string) => {
  const matches = controlTests.filter(test => test.owner.toLowerCase() === ownerName.toLowerCase());
  if (matches.length === 0) {
    return `No control tests found for owner ${ownerName}.`;
  }

  const summary = matches
    .map(test => `- ${test.controlArea} (${test.id}) | Status: ${test.testStatus}`)
    .join("\n");

  return `Control tests owned by ${ownerName}:\n${summary}`;
};

server.registerTool("list_control_tests", {
  title: "List Control Tests",
  description: "List the control tests in the guided assurance dataset",
}, async () => {
  return {
    content: [{ type: "text", text: getAllControlTestsText() }],
  };
});

server.registerTool("get_assurance_summary", {
  title: "Get Assurance Summary",
  description: "Provide a high-level summary of control testing progress",
}, async () => {
  return {
    content: [{ type: "text", text: getControlTestStatusSummaryText() }],
  };
});

server.registerTool("find_tests_by_owner", {
  title: "Find Tests By Owner",
  description: "List control tests assigned to a specific owner",
  inputSchema: {
    ownerName: z.string().describe("Owner name"),
  },
}, async ({ ownerName }) => {
  return {
    content: [{ type: "text", text: getTestsByOwnerText(ownerName) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
