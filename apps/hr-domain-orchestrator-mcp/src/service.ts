import { fileURLToPath } from "url";
import { McpLeafProxyClient } from "./mcpLeafProxyClient.js";

export const hrLeafServers = [
  {
    name: "leave-management-mcp",
    purpose: "Leave balances, leave requests, approvals, and manager review flows",
    tools: ["list_all_employees", "list_all_managers", "check_leave_balance", "get_employee_manager", "get_employee_profile", "apply_leave", "list_employee_leaves", "list_pending_approvals", "approve_leave", "partial_approve_leave", "reject_leave"],
  },
  {
    name: "payroll-mcp",
    purpose: "Payroll summaries, last pay dates, and pay component lookups",
    tools: ["get_payroll_summary", "get_last_pay_date", "list_pay_components"],
  },
] as const;

const leaveManagementProxy = new McpLeafProxyClient({
  name: "leave-management-mcp",
  cwd: fileURLToPath(new URL("../../../leaf-servers/leave-management-mcp", import.meta.url)),
});

const payrollProxy = new McpLeafProxyClient({
  name: "payroll-mcp",
  cwd: fileURLToPath(new URL("../../../leaf-servers/payroll-mcp", import.meta.url)),
});

const getQueryTokens = (query: string) =>
  (query.toLowerCase().match(/[a-z]+/g) ?? []).filter(token => token.length > 2);

const extractPeopleNamesFromList = (text: string) =>
  text
    .split("\n")
    .filter(line => line.startsWith("- "))
    .map(line => line.match(/^- (.+?) \([^)]+\)/)?.[1])
    .filter((name): name is string => Boolean(name));

const extractLeaveRequestCount = (text: string) => {
  if (text.startsWith("No leave requests found for ")) {
    return 0;
  }

  return text
    .split("\n")
    .filter(line => line.startsWith("- ["))
    .length;
};

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

const isGenericEmployeeIntent = (normalizedRequest: string) =>
  normalizedRequest.includes("tell me about")
  || normalizedRequest.includes("details")
  || normalizedRequest.includes("detail")
  || normalizedRequest.includes("information")
  || normalizedRequest.includes("info")
  || normalizedRequest.includes("what do you know")
  || normalizedRequest.includes("show me more");

const buildEmployeeDetailOptionsText = (employeeName: string) =>
  `I found ${employeeName} in HR data. Which detail do you want?\n- Manager\n- Employee profile\n- Leave balance\n- Leave history\n- Leave request count\n- Payroll summary\n- Last pay date\n- Pay components`;

const buildEmployeeMatchOptionsText = (matches: string[]) =>
  `I found multiple employees in the HR domain matching your request:\n- ${matches.join("\n- ")}\nWhich employee do you want details for?`;

const buildManagerMatchOptionsText = (matches: string[]) =>
  `I found multiple managers in the HR domain matching your request:\n- ${matches.join("\n- ")}\nWhich manager do you want to use?`;

export const callLeaveTool = (toolName: string, args: Record<string, unknown> = {}) =>
  leaveManagementProxy.callTextTool(toolName, args);

export const callPayrollTool = (toolName: string, args: Record<string, unknown> = {}) =>
  payrollProxy.callTextTool(toolName, args);

export const listAllEmployees = async () => leaveManagementProxy.callTextTool("list_all_employees");
export const listAllManagers = async () => leaveManagementProxy.callTextTool("list_all_managers");
export const checkLeaveBalance = async (employeeName: string) => leaveManagementProxy.callTextTool("check_leave_balance", { employeeName });
export const getEmployeeManager = async (employeeName: string) => leaveManagementProxy.callTextTool("get_employee_manager", { employeeName });
export const getEmployeeProfile = async (employeeName: string) => leaveManagementProxy.callTextTool("get_employee_profile", { employeeName });
export const applyLeave = async (employeeName: string, leaveType: "Annual" | "Sick" | "Unpaid", startDate: string, endDate: string, reason: string) =>
  leaveManagementProxy.callTextTool("apply_leave", { employeeName, leaveType, startDate, endDate, reason });
export const listEmployeeLeaves = async (employeeName: string) => leaveManagementProxy.callTextTool("list_employee_leaves", { employeeName });
export const listPendingApprovals = async (managerName: string) => leaveManagementProxy.callTextTool("list_pending_approvals", { managerName });
export const approveLeave = async (leaveRequestId: string, managerName: string) => leaveManagementProxy.callTextTool("approve_leave", { leaveRequestId, managerName });
export const partialApproveLeave = async (leaveRequestId: string, managerName: string, approvedDays: number, rejectionReason: string) =>
  leaveManagementProxy.callTextTool("partial_approve_leave", { leaveRequestId, managerName, approvedDays, rejectionReason });
export const rejectLeave = async (leaveRequestId: string, managerName: string, reason: string) =>
  leaveManagementProxy.callTextTool("reject_leave", { leaveRequestId, managerName, reason });
export const getPayrollSummary = async (employeeName: string) => payrollProxy.callTextTool("get_payroll_summary", { employeeName });
export const getLastPayDate = async (employeeName: string) => payrollProxy.callTextTool("get_last_pay_date", { employeeName });
export const listPayComponents = async (employeeName: string) => payrollProxy.callTextTool("list_pay_components", { employeeName });

export const findHrPeopleMatches = async (request: string) => {
  const people = extractPeopleNamesFromList(await listAllEmployees());
  return findMatchingNames(request, people);
};

export const findHrManagerMatches = async (request: string) => {
  const managers = extractPeopleNamesFromList(await listAllManagers());
  return findMatchingNames(request, managers);
};

export const listHrLeafServersText = () => {
  const summary = hrLeafServers.map(serverInfo => `- ${serverInfo.name}: ${serverInfo.purpose}`).join("\n");
  return `HR domain leaf MCP servers:\n${summary}`;
};

export const listHrToolsText = () => {
  const summary = hrLeafServers.map(serverInfo => `- ${serverInfo.name}: ${serverInfo.tools.join(", ")}`).join("\n");
  return `Tools exposed by the HR domain proxy:\n${summary}`;
};

export const handleHrRequest = async (userRequest: string, employeeOverride?: string) => {
  const normalizedRequest = userRequest.toLowerCase();
  const personMatches = employeeOverride ? [employeeOverride] : await findHrPeopleMatches(userRequest);
  const managerMatches = await findHrManagerMatches(userRequest);

  if (!employeeOverride && personMatches.length > 1) {
    return buildEmployeeMatchOptionsText(personMatches);
  }

  if (managerMatches.length > 1) {
    return buildManagerMatchOptionsText(managerMatches);
  }

  const personName = personMatches[0];
  const managerName = managerMatches[0];

  if (normalizedRequest.includes("all employees") || normalizedRequest.includes("list employees") || normalizedRequest.includes("list all employees")) {
    return listAllEmployees();
  }

  if (normalizedRequest.includes("all managers") || normalizedRequest.includes("list managers") || normalizedRequest.includes("list all managers")) {
    return listAllManagers();
  }

  if ((normalizedRequest.includes("leave request count") || normalizedRequest.includes("how many leave requests") || normalizedRequest.includes("number of leave requests")) && personName) {
    const leaveHistoryText = await listEmployeeLeaves(personName);
    return `Leave request count for ${personName}: ${extractLeaveRequestCount(leaveHistoryText)}`;
  }

  if ((normalizedRequest.includes("leave requests") || normalizedRequest.includes("employee leaves") || normalizedRequest.includes("leave history")) && personName) {
    return listEmployeeLeaves(personName);
  }

  if ((normalizedRequest.includes("leave balance") || normalizedRequest.includes("leave remaining")) && personName) {
    return checkLeaveBalance(personName);
  }

  if ((normalizedRequest.includes("manager") || normalizedRequest.includes("reports to") || normalizedRequest.includes("reporting manager")) && personName) {
    return getEmployeeManager(personName);
  }

  if ((normalizedRequest.includes("profile") || normalizedRequest.includes("manager id")) && personName) {
    return getEmployeeProfile(personName);
  }

  if ((normalizedRequest.includes("pending approvals") || normalizedRequest.includes("pending leaves")) && managerName) {
    return listPendingApprovals(managerName);
  }

  if ((normalizedRequest.includes("last pay date") || normalizedRequest.includes("pay date")) && personName) {
    return getLastPayDate(personName);
  }

  if ((normalizedRequest.includes("pay components") || normalizedRequest.includes("salary components") || normalizedRequest.includes("compensation components")) && personName) {
    return listPayComponents(personName);
  }

  if ((normalizedRequest.includes("payroll") || normalizedRequest.includes("salary") || normalizedRequest.includes("compensation")) && personName) {
    return getPayrollSummary(personName);
  }

  if (personName && isGenericEmployeeIntent(normalizedRequest)) {
    return buildEmployeeDetailOptionsText(personName);
  }

  return `${listHrToolsText()}\n- HR domain note: The request did not map cleanly to one leave or payroll tool.`;
};