import { fileURLToPath } from "url";
import { McpLeafProxyClient } from "./mcpLeafProxyClient.js";

export const auditLeafServers = [
  {
    name: "engagement-manager-mcp",
    purpose: "Engagement portfolio, regional coverage, and status views",
    tools: ["list_active_engagements", "get_engagement_status", "get_engagement_staffing", "list_engagements_by_region"],
  },
  {
    name: "guided-assurance-mcp",
    purpose: "Control testing inventory, assurance summaries, and owner-based views",
    tools: ["list_control_tests", "get_assurance_summary", "find_tests_by_owner"],
  },
 ] as const;

const engagementManagerProxy = new McpLeafProxyClient({
  name: "engagement-manager-mcp",
  cwd: fileURLToPath(new URL("../../../leaf-servers/engagement-manager-mcp", import.meta.url)),
});

const guidedAssuranceProxy = new McpLeafProxyClient({
  name: "guided-assurance-mcp",
  cwd: fileURLToPath(new URL("../../../leaf-servers/guided-assurance-mcp", import.meta.url)),
});

const getQueryTokens = (query: string) =>
  (query.toLowerCase().match(/[a-z]+/g) ?? []).filter(token => token.length > 2);

const extractEngagementNamesFromList = (text: string) =>
  text
    .split("\n")
    .filter(line => line.startsWith("- "))
    .map(line => line.match(/^- (.+?) \([^)]+\)/)?.[1])
    .filter((name): name is string => Boolean(name));

const findMatchingNames = (query: string, names: string[]) => {
  const normalizedQuery = query.toLowerCase();
  const queryTokens = getQueryTokens(query);

  return names.filter(name => {
    const normalizedName = name.toLowerCase();
    if (normalizedQuery.includes(normalizedName)) {
      return true;
    }

    return normalizedName
      .split(/\s+/)
      .some(token => token.length > 2 && queryTokens.includes(token));
  });
};

const buildEngagementDetailOptionsText = (engagementName: string) =>
  `I found ${engagementName} in the Cloud Audit domain. Which detail do you want?\n- Engagement status and client details\n- Staffed employees\n- Regional context`;

const buildEngagementMatchOptionsText = (matches: string[]) =>
  `I found multiple engagements in the Cloud Audit domain matching your request:\n- ${matches.join("\n- ")}\nWhich engagement do you want details for?`;

const isGenericEngagementIntent = (normalizedRequest: string) =>
  normalizedRequest.includes("tell me about")
  || normalizedRequest.includes("details")
  || normalizedRequest.includes("detail")
  || normalizedRequest.includes("information")
  || normalizedRequest.includes("info")
  || normalizedRequest.includes("show me more");

export const callEngagementTool = (toolName: string, args: Record<string, unknown> = {}) =>
  engagementManagerProxy.callTextTool(toolName, args);

export const callAssuranceTool = (toolName: string, args: Record<string, unknown> = {}) =>
  guidedAssuranceProxy.callTextTool(toolName, args);

export const listActiveEngagements = async () => engagementManagerProxy.callTextTool("list_active_engagements");
export const getEngagementStatus = async (engagementName: string) => engagementManagerProxy.callTextTool("get_engagement_status", { engagementName });
export const getEngagementStaffing = async (engagementName: string) => engagementManagerProxy.callTextTool("get_engagement_staffing", { engagementName });
export const listEngagementsByRegion = async (region: string) => engagementManagerProxy.callTextTool("list_engagements_by_region", { region });
export const listControlTests = async () => guidedAssuranceProxy.callTextTool("list_control_tests");
export const getAssuranceSummary = async () => guidedAssuranceProxy.callTextTool("get_assurance_summary");
export const findTestsByOwner = async (ownerName: string) => guidedAssuranceProxy.callTextTool("find_tests_by_owner", { ownerName });

export const findEngagementMatches = async (request: string) => {
  const names = extractEngagementNamesFromList(await listActiveEngagements());
  return findMatchingNames(request, names);
};

export const listCloudAuditLeafServersText = () => {
  const summary = auditLeafServers
    .map(serverInfo => `- ${serverInfo.name}: ${serverInfo.purpose}`)
    .join("\n");
  return `Cloud Audit Suite leaf MCP servers:\n${summary}`;
};

export const listCloudAuditToolsText = () => {
  const summary = auditLeafServers
    .map(serverInfo => `- ${serverInfo.name}: ${serverInfo.tools.join(", ")}`)
    .join("\n");
  return `Tools exposed by the Cloud Audit domain proxy:\n${summary}`;
};

export const handleCloudAuditRequest = async (userRequest: string) => {
  const normalizedRequest = userRequest.toLowerCase();
  const engagementMatches = await findEngagementMatches(userRequest);

  if (engagementMatches.length > 1) {
    return buildEngagementMatchOptionsText(engagementMatches);
  }

  const engagementName = engagementMatches[0];

  if ((normalizedRequest.includes("worked on") || normalizedRequest.includes("who worked") || normalizedRequest.includes("staffed")) && engagementName) {
    return getEngagementStaffing(engagementName);
  }

  if ((normalizedRequest.includes("engagement status") || normalizedRequest.includes("status")) && engagementName) {
    return getEngagementStatus(engagementName);
  }

  if (normalizedRequest.includes("active engagement") || normalizedRequest.includes("list engagements")) {
    return listActiveEngagements();
  }

  if ((normalizedRequest.includes("region") || normalizedRequest.includes("regional")) && (normalizedRequest.includes("us") || normalizedRequest.includes("latam") || normalizedRequest.includes("emea") || normalizedRequest.includes("apac"))) {
    const region = ["US", "LATAM", "EMEA", "APAC"].find(value => normalizedRequest.includes(value.toLowerCase()));
    if (region) {
      return listEngagementsByRegion(region);
    }
  }

  if (engagementName && isGenericEngagementIntent(normalizedRequest)) {
    return buildEngagementDetailOptionsText(engagementName);
  }

  if (normalizedRequest.includes("tests owned by ")) {
    const ownerName = userRequest.split(/tests owned by /i)[1]?.trim();
    if (ownerName) {
      return findTestsByOwner(ownerName);
    }
  }

  if (normalizedRequest.includes("list control tests")) {
    return listControlTests();
  }

  if (normalizedRequest.includes("control") || normalizedRequest.includes("assurance") || normalizedRequest.includes("test")) {
    return getAssuranceSummary();
  }

  return `${listCloudAuditToolsText()}\n- Cloud Audit domain note: The request did not map cleanly to one engagement or assurance tool.`;
};