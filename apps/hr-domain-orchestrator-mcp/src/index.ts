import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import {
  approveLeave,
  applyLeave,
  checkLeaveBalance,
  getEmployeeManager,
  getEmployeeProfile,
  getLastPayDate,
  getPayrollSummary,
  handleHrRequest,
  listAllEmployees,
  listAllManagers,
  listEmployeeLeaves,
  listHrLeafServersText,
  listHrToolsText,
  listPayComponents,
  listPendingApprovals,
  partialApproveLeave,
  rejectLeave,
} from "./service.js";

const server = new McpServer({
  name: "hr-domain-orchestrator-mcp",
  version: "1.0.0",
});

server.registerTool("list_hr_leaf_servers", {
  title: "List HR Leaf Servers",
  description: "List the two HR leaf MCP servers proxied by this domain connector",
}, async () => {
  return {
    content: [{ type: "text", text: listHrLeafServersText() }],
  };
});

server.registerTool("list_hr_tools", {
  title: "List HR Tools",
  description: "List the leave and payroll tools exposed by the HR domain proxy",
}, async () => ({
  content: [{ type: "text", text: listHrToolsText() }],
}));

server.registerTool("handle_hr_request", {
  title: "Handle HR Request",
  description: "Handle a natural-language HR request by routing it to the relevant leave-management or payroll leaf MCP",
  inputSchema: {
    userRequest: z.string().describe("HR-related user request"),
  },
}, async ({ userRequest }) => {
  return {
    content: [{ type: "text", text: await handleHrRequest(userRequest) }],
  };
});

server.registerTool("list_all_employees", {
  title: "List All Employees",
  description: "Proxy list_all_employees to the leave-management leaf MCP",
}, async () => ({
  content: [{ type: "text", text: await listAllEmployees() }],
}));

server.registerTool("list_all_managers", {
  title: "List All Managers",
  description: "Proxy list_all_managers to the leave-management leaf MCP",
}, async () => ({
  content: [{ type: "text", text: await listAllManagers() }],
}));

server.registerTool("check_leave_balance", {
  title: "Check Leave Balance",
  description: "Proxy check_leave_balance to the leave-management leaf MCP",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => ({
  content: [{ type: "text", text: await checkLeaveBalance(employeeName) }],
}));

server.registerTool("get_employee_manager", {
  title: "Get Employee Manager",
  description: "Proxy get_employee_manager to the leave-management leaf MCP",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => ({
  content: [{ type: "text", text: await getEmployeeManager(employeeName) }],
}));

server.registerTool("get_employee_profile", {
  title: "Get Employee Profile",
  description: "Proxy get_employee_profile to the leave-management leaf MCP",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => ({
  content: [{ type: "text", text: await getEmployeeProfile(employeeName) }],
}));

server.registerTool("apply_leave", {
  title: "Apply Leave",
  description: "Proxy apply_leave to the leave-management leaf MCP",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
    leaveType: z.enum(["Annual", "Sick", "Unpaid"]).describe("Type of leave"),
    startDate: z.string().describe("Start date in YYYY-MM-DD format"),
    endDate: z.string().describe("End date in YYYY-MM-DD format"),
    reason: z.string().describe("Reason for the leave"),
  },
}, async ({ employeeName, leaveType, startDate, endDate, reason }) => ({
  content: [{ type: "text", text: await applyLeave(employeeName, leaveType, startDate, endDate, reason) }],
}));

server.registerTool("list_employee_leaves", {
  title: "List Employee Leaves",
  description: "Proxy list_employee_leaves to the leave-management leaf MCP",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => ({
  content: [{ type: "text", text: await listEmployeeLeaves(employeeName) }],
}));

server.registerTool("list_pending_approvals", {
  title: "List Pending Approvals",
  description: "Proxy list_pending_approvals to the leave-management leaf MCP",
  inputSchema: {
    managerName: z.string().describe("Full name of the manager"),
  },
}, async ({ managerName }) => ({
  content: [{ type: "text", text: await listPendingApprovals(managerName) }],
}));

server.registerTool("approve_leave", {
  title: "Approve Leave",
  description: "Proxy approve_leave to the leave-management leaf MCP",
  inputSchema: {
    leaveRequestId: z.string().describe("The leave request ID to approve"),
    managerName: z.string().describe("Full name of the approving manager"),
  },
}, async ({ leaveRequestId, managerName }) => ({
  content: [{ type: "text", text: await approveLeave(leaveRequestId, managerName) }],
}));

server.registerTool("partial_approve_leave", {
  title: "Partial Approve Leave",
  description: "Proxy partial_approve_leave to the leave-management leaf MCP",
  inputSchema: {
    leaveRequestId: z.string().describe("The leave request ID to partially approve"),
    managerName: z.string().describe("Full name of the approving manager"),
    approvedDays: z.number().int().positive().describe("How many days to approve"),
    rejectionReason: z.string().describe("Reason the remaining requested days are rejected"),
  },
}, async ({ leaveRequestId, managerName, approvedDays, rejectionReason }) => ({
  content: [{ type: "text", text: await partialApproveLeave(leaveRequestId, managerName, approvedDays, rejectionReason) }],
}));

server.registerTool("reject_leave", {
  title: "Reject Leave",
  description: "Proxy reject_leave to the leave-management leaf MCP",
  inputSchema: {
    leaveRequestId: z.string().describe("The leave request ID to reject"),
    managerName: z.string().describe("Full name of the rejecting manager"),
    reason: z.string().describe("Reason for rejection"),
  },
}, async ({ leaveRequestId, managerName, reason }) => ({
  content: [{ type: "text", text: await rejectLeave(leaveRequestId, managerName, reason) }],
}));

server.registerTool("get_payroll_summary", {
  title: "Get Payroll Summary",
  description: "Proxy get_payroll_summary to the payroll leaf MCP",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => ({
  content: [{ type: "text", text: await getPayrollSummary(employeeName) }],
}));

server.registerTool("get_last_pay_date", {
  title: "Get Last Pay Date",
  description: "Proxy get_last_pay_date to the payroll leaf MCP",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => ({
  content: [{ type: "text", text: await getLastPayDate(employeeName) }],
}));

server.registerTool("list_pay_components", {
  title: "List Pay Components",
  description: "Proxy list_pay_components to the payroll leaf MCP",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => ({
  content: [{ type: "text", text: await listPayComponents(employeeName) }],
}));

const transport = new StdioServerTransport();
await server.connect(transport);