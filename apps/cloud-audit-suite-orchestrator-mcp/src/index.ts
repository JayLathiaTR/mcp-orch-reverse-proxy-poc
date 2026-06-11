import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import {
  findTestsByOwner,
  getAssuranceSummary,
  getEngagementStaffing,
  getEngagementStatus,
  handleCloudAuditRequest,
  listActiveEngagements,
  listCloudAuditLeafServersText,
  listCloudAuditToolsText,
  listControlTests,
  listEngagementsByRegion,
} from "./service.js";

const server = new McpServer({
  name: "cloud-audit-suite-orchestrator-mcp",
  version: "1.0.0",
});

server.registerTool("list_cloud_audit_leaf_servers", {
  title: "List Cloud Audit Leaf Servers",
  description: "List the leaf MCP servers under the Cloud Audit domain connector",
}, async () => {
  return {
    content: [{ type: "text", text: listCloudAuditLeafServersText() }],
  };
});

server.registerTool("list_cloud_audit_tools", {
  title: "List Cloud Audit Tools",
  description: "List the engagement and assurance tools exposed by the Cloud Audit domain proxy",
}, async () => {
  return {
    content: [{ type: "text", text: listCloudAuditToolsText() }],
  };
});

server.registerTool("handle_cloud_audit_request", {
  title: "Handle Cloud Audit Request",
  description: "Handle a natural-language Cloud Audit request by routing it to the engagement or guided assurance leaf MCP",
  inputSchema: {
    userRequest: z.string().describe("Audit-related user request"),
  },
}, async ({ userRequest }) => {
  return {
    content: [{ type: "text", text: await handleCloudAuditRequest(userRequest) }],
  };
});

server.registerTool("list_active_engagements", {
  title: "List Active Engagements",
  description: "Proxy list_active_engagements to the engagement-manager leaf MCP",
}, async () => ({
  content: [{ type: "text", text: await listActiveEngagements() }],
}));

server.registerTool("get_engagement_status", {
  title: "Get Engagement Status",
  description: "Proxy get_engagement_status to the engagement-manager leaf MCP",
  inputSchema: {
    engagementName: z.string().describe("Engagement name"),
  },
}, async ({ engagementName }) => ({
  content: [{ type: "text", text: await getEngagementStatus(engagementName) }],
}));

server.registerTool("get_engagement_staffing", {
  title: "Get Engagement Staffing",
  description: "Proxy get_engagement_staffing to the engagement-manager leaf MCP",
  inputSchema: {
    engagementName: z.string().describe("Engagement name"),
  },
}, async ({ engagementName }) => ({
  content: [{ type: "text", text: await getEngagementStaffing(engagementName) }],
}));

server.registerTool("list_engagements_by_region", {
  title: "List Engagements By Region",
  description: "Proxy list_engagements_by_region to the engagement-manager leaf MCP",
  inputSchema: {
    region: z.string().describe("Region such as US or LATAM"),
  },
}, async ({ region }) => ({
  content: [{ type: "text", text: await listEngagementsByRegion(region) }],
}));

server.registerTool("list_control_tests", {
  title: "List Control Tests",
  description: "Proxy list_control_tests to the guided-assurance leaf MCP",
}, async () => ({
  content: [{ type: "text", text: await listControlTests() }],
}));

server.registerTool("get_assurance_summary", {
  title: "Get Assurance Summary",
  description: "Proxy get_assurance_summary to the guided-assurance leaf MCP",
}, async () => ({
  content: [{ type: "text", text: await getAssuranceSummary() }],
}));

server.registerTool("find_tests_by_owner", {
  title: "Find Tests By Owner",
  description: "Proxy find_tests_by_owner to the guided-assurance leaf MCP",
  inputSchema: {
    ownerName: z.string().describe("Owner name"),
  },
}, async ({ ownerName }) => ({
  content: [{ type: "text", text: await findTestsByOwner(ownerName) }],
}));

const transport = new StdioServerTransport();
await server.connect(transport);