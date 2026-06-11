import { engagements } from "./data.js";

const getQueryTokens = (query: string) =>
  (query.toLowerCase().match(/[a-z]+/g) ?? []).filter(token => token.length > 2);

export const findMatchingEngagementNames = (query: string) => {
  const normalizedQuery = query.toLowerCase();
  const queryTokens = getQueryTokens(query);

  return engagements
    .filter(engagement => {
      const name = engagement.name.toLowerCase();
      if (normalizedQuery.includes(name)) {
        return true;
      }

      const nameTokens = name.split(/\s+/).filter(token => token.length > 2);
      return nameTokens.some(token => queryTokens.includes(token));
    })
    .map(engagement => engagement.name);
};

export const getKnownEngagementNames = () => engagements.map(engagement => engagement.name);

export const getAllEngagementsText = () => {
  const activeEngagements = engagements.filter(engagement => engagement.status !== "Completed");
  const summary = activeEngagements
    .map(engagement => `- ${engagement.name} (${engagement.id}) | Client: ${engagement.clientName} | Status: ${engagement.status} | Manager: ${engagement.engagementManager}`)
    .join("\n");

  return `Active engagement portfolio:\n${summary}`;
};

export const getEngagementStatusText = (engagementName: string) => {
  const engagement = engagements.find(item => item.name.toLowerCase() === engagementName.toLowerCase());
  if (!engagement) {
    return `No engagement found with the name ${engagementName}.`;
  }

  return `Engagement status for ${engagement.name}:\n- Engagement ID: ${engagement.id}\n- Client: ${engagement.clientName}\n- Status: ${engagement.status}\n- Engagement manager: ${engagement.engagementManager}\n- Region: ${engagement.region}`;
};

export const getEngagementsByRegionText = (region: string) => {
  const matches = engagements.filter(item => item.region.toLowerCase() === region.toLowerCase());
  if (matches.length === 0) {
    return `No engagements found for region ${region}.`;
  }

  const summary = matches
    .map(item => `- ${item.name} | Client: ${item.clientName} | Status: ${item.status}`)
    .join("\n");

  return `Engagements in ${region}:\n${summary}`;
};

export const getEngagementStaffingText = (engagementName: string) => {
  const engagement = engagements.find(item => item.name.toLowerCase() === engagementName.toLowerCase());
  if (!engagement) {
    return { text: `No engagement found with the name ${engagementName}.` };
  }

  return {
    text: `Engagement staffing for ${engagement.name}:\n- Staffed employees: ${engagement.staffedEmployees.join(", ")}`,
    firstEmployee: engagement.staffedEmployees[0],
    staffedEmployees: engagement.staffedEmployees,
  };
};