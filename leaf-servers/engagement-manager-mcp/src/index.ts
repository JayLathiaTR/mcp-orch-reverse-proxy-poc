import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import { engagements } from "./data.js";
import { getEngagementStaffingText } from "./service.js";

const server = new McpServer({
  name: "engagement-manager-mcp",
  version: "1.0.0",
});

const getAllEngagementsText = () => {
  const activeEngagements = engagements.filter(engagement => engagement.status !== "Completed");
  const summary = activeEngagements
    .map(engagement => `- ${engagement.name} (${engagement.id}) | Client: ${engagement.clientName} | Status: ${engagement.status} | Manager: ${engagement.engagementManager}`)
    .join("\n");

  return `Active engagement portfolio:\n${summary}`;
};

const getEngagementStatusText = (engagementName: string) => {
  const engagement = engagements.find(item => item.name.toLowerCase() === engagementName.toLowerCase());
  if (!engagement) {
    return `No engagement found with the name ${engagementName}.`;
  }

  return `Engagement status for ${engagement.name}:\n- Engagement ID: ${engagement.id}\n- Client: ${engagement.clientName}\n- Status: ${engagement.status}\n- Engagement manager: ${engagement.engagementManager}\n- Region: ${engagement.region}`;
};

const getEngagementsByRegionText = (region: string) => {
  const matches = engagements.filter(item => item.region.toLowerCase() === region.toLowerCase());
  if (matches.length === 0) {
    return `No engagements found for region ${region}.`;
  }

  const summary = matches
    .map(item => `- ${item.name} | Client: ${item.clientName} | Status: ${item.status}`)
    .join("\n");

  return `Engagements in ${region}:\n${summary}`;
};

server.registerTool("list_active_engagements", {
  title: "List Active Engagements",
  description: "List active and in-flight audit engagements",
}, async () => {
  return {
    content: [{ type: "text", text: getAllEngagementsText() }],
  };
});

server.registerTool("get_engagement_status", {
  title: "Get Engagement Status",
  description: "Return the current status for an engagement",
  inputSchema: {
    engagementName: z.string().describe("Engagement name"),
  },
}, async ({ engagementName }) => {
  return {
    content: [{ type: "text", text: getEngagementStatusText(engagementName) }],
  };
});

server.registerTool("get_engagement_staffing", {
  title: "Get Engagement Staffing",
  description: "Return the staffed employees for an engagement",
  inputSchema: {
    engagementName: z.string().describe("Engagement name"),
  },
}, async ({ engagementName }) => ({
  content: [{ type: "text", text: getEngagementStaffingText(engagementName).text }],
}));

server.registerTool("list_engagements_by_region", {
  title: "List Engagements By Region",
  description: "List engagements for a given region",
  inputSchema: {
    region: z.string().describe("Region such as US or LATAM"),
  },
}, async ({ region }) => {
  return {
    content: [{ type: "text", text: getEngagementsByRegionText(region) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
