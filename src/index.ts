import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { employees, leaveRequests, LeaveType, managers } from "./data.js";
import type { Employee, LeaveRequest } from "./data.js";
import z from "zod";

const server = new McpServer({
  name: "leave-management",
  version: "1.0.0",
});

const people = [...employees, ...managers];

const findPersonByName = (name: string) =>
  people.find(person => person.name.toLowerCase() === name.toLowerCase());

const findPersonById = (id: string) =>
  people.find(person => person.id === id);

const findManagerByName = (name: string) =>
  managers.find(manager => manager.name.toLowerCase() === name.toLowerCase());

const getPosition = (id: string) =>
  managers.some(manager => manager.id === id) ? "Manager" : "Employee";

const parseIsoDate = (value: string) => {
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!isoDatePattern.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getLeaveDurationInDays = (startDate: string, endDate: string) => {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);

  if (!start || !end) {
    return { error: "Dates must be provided in YYYY-MM-DD format." };
  }

  if (end < start) {
    return { error: "End date cannot be earlier than start date." };
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const durationInDays = Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;

  return { days: durationInDays };
};

const canManagerReviewEmployee = (manager: Employee, employee: Employee) =>
  employee.managerId === manager.id;

const formatLeaveRequestSummary = (request: LeaveRequest) => {
  const summaryParts = [
    `- [${request.id}] ${request.type}`,
    `${request.startDate} to ${request.endDate}`,
    request.status,
    `Requested: ${request.requestedDays} day(s)`,
  ];

  if (request.approvedDays > 0) {
    summaryParts.push(`Approved: ${request.approvedDays} day(s)`);
  }

  if (request.rejectedDays > 0) {
    summaryParts.push(`Rejected: ${request.rejectedDays} day(s)`);
  }

  summaryParts.push(`Reason: ${request.reason}`);

  if (request.managerComment) {
    summaryParts.push(`Manager comment: ${request.managerComment}`);
  }

  return summaryParts.join(" | ");
};

server.registerTool("ping", {
  title: "Ping",
  description: "Check if the server is running",
}, async () => ({
  content: [{ type: "text", text: "Leave Management MCP server is alive!" }],
}));

server.registerTool("list_all_employees", {
  title: "List All Employees",
  description: "List all employees available in the leave management system",
}, async () => {
  if (people.length === 0) {
    return {
      content: [{ type: "text", text: "No employees found in the leave management system." }],
    };
  }

  const summary = people
    .map(person => `- ${person.name} (${person.id}) | Department: ${person.department} | Position: ${getPosition(person.id)}`)
    .join("\n");

  return {
    content: [{ type: "text", text: `Employees:\n${summary}` }],
  };
});

server.registerTool("list_all_managers", {
  title: "List All Managers",
  description: "List all managers available in the leave management system",
}, async () => {
  if (managers.length === 0) {
    return {
      content: [{ type: "text", text: "No managers found in the leave management system." }],
    };
  }

  const summary = managers
    .map(manager => `- ${manager.name} (${manager.id}) | Department: ${manager.department} | Position: Manager`)
    .join("\n");

  return {
    content: [{ type: "text", text: `Managers:\n${summary}` }],
  };
});

server.registerTool("check_leave_balance", {
  title: "Check Leave Balance",
  description: "Check remaining leave days for an employee",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => {
  const emp = findPersonByName(employeeName);
  if (!emp) {
    return { content: [{ type: "text", text: `Employee "${employeeName}" not found.` }] };
  }
  const { Annual, Sick, Unpaid } = emp.leaveBalance;
  return {
    content: [{ type: "text", text: `Leave balance for ${emp.name}:\n- Annual: ${Annual} days\n- Sick: ${Sick} days\n- Unpaid: ${Unpaid} days` }],
  };
});

server.registerTool("apply_leave", {
  title: "Apply for Leave",
  description: "Submit a leave request for an employee",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
    leaveType: z.enum(["Annual", "Sick", "Unpaid"]).describe("Type of leave"),
    startDate: z.string().describe("Start date in YYYY-MM-DD format"),
    endDate: z.string().describe("End date in YYYY-MM-DD format"),
    reason: z.string().describe("Reason for the leave"),
  },
}, async ({ employeeName, leaveType, startDate, endDate, reason }) => {
  const emp = findPersonByName(employeeName);
  if (!emp) {
    return { content: [{ type: "text", text: `Employee "${employeeName}" not found.` }] };
  }

  const leaveDuration = getLeaveDurationInDays(startDate, endDate);
  if ("error" in leaveDuration) {
    return { content: [{ type: "text", text: `Unable to submit leave request: ${leaveDuration.error}` }] };
  }

  const requestedDays = leaveDuration.days;
  const availableBalance = emp.leaveBalance[leaveType];

  if (requestedDays > availableBalance) {
    return {
      content: [{
        type: "text",
        text: `Unable to submit leave request for ${emp.name}. Requested ${requestedDays} ${leaveType} day(s), but only ${availableBalance} day(s) are available.`,
      }],
    };
  }

  const id = `LR${Date.now()}`;
  leaveRequests.push({
    id,
    employeeId: emp.id,
    type: leaveType as LeaveType,
    startDate,
    endDate,
    requestedDays,
    approvedDays: 0,
    rejectedDays: 0,
    reason,
    status: "Pending",
  });
  return {
    content: [{ type: "text", text: `Leave request submitted!\nID: ${id}\nEmployee: ${emp.name}\nType: ${leaveType}\nFrom: ${startDate} To: ${endDate}\nRequested days: ${requestedDays}\nAvailable balance: ${availableBalance}\nStatus: Pending` }],
  };
});

server.registerTool("list_employee_leaves", {
  title: "List Employee Leaves",
  description: "List all leave requests for an employee",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => {
  const emp = findPersonByName(employeeName);
  if (!emp) {
    return { content: [{ type: "text", text: `Employee "${employeeName}" not found.` }] };
  }
  const requests = leaveRequests.filter(r => r.employeeId === emp.id);
  if (requests.length === 0) {
    return { content: [{ type: "text", text: `No leave requests found for ${emp.name}.` }] };
  }
  const summary = requests.map(formatLeaveRequestSummary).join("\n");
  return { content: [{ type: "text", text: `Leave requests for ${emp.name}:\n${summary}` }] };
});

server.registerTool("list_pending_approvals", {
  title: "List Pending Approvals",
  description: "List all pending leave requests for a manager's team",
  inputSchema: {
    managerName: z.string().describe("Full name of the manager"),
  },
}, async ({ managerName }) => {
  const manager = findManagerByName(managerName);
  if (!manager) {
    return { content: [{ type: "text", text: `Manager "${managerName}" not found.` }] };
  }
  const teamIds = employees.filter(e => e.managerId === manager.id).map(e => e.id);
  const pending = leaveRequests.filter(r => teamIds.includes(r.employeeId) && r.status === "Pending");
  if (pending.length === 0) {
    return { content: [{ type: "text", text: `No pending leave requests for ${managerName}'s team.` }] };
  }
  const emp = (id: string) => findPersonById(id)?.name ?? id;
  const summary = pending.map(r => `${formatLeaveRequestSummary(r)} | Employee: ${emp(r.employeeId)}`).join("\n");
  return { content: [{ type: "text", text: `Pending approvals for ${managerName}:\n${summary}` }] };
});

server.registerTool("approve_leave", {
  title: "Approve Leave",
  description: "Approve a pending leave request",
  inputSchema: {
    leaveRequestId: z.string().describe("The leave request ID to approve"),
    managerName: z.string().describe("Full name of the approving manager"),
  },
}, async ({ leaveRequestId, managerName }) => {
  const manager = findManagerByName(managerName);
  if (!manager) {
    return { content: [{ type: "text", text: `Manager "${managerName}" not found.` }] };
  }
  const request = leaveRequests.find(r => r.id === leaveRequestId);
  if (!request) {
    return { content: [{ type: "text", text: `Leave request "${leaveRequestId}" not found.` }] };
  }
  if (request.status !== "Pending") {
    return { content: [{ type: "text", text: `Leave request "${leaveRequestId}" is already ${request.status}.` }] };
  }

  const employee = findPersonById(request.employeeId);
  if (!employee) {
    return { content: [{ type: "text", text: `Employee record for leave request "${leaveRequestId}" was not found.` }] };
  }

  if (!canManagerReviewEmployee(manager, employee)) {
    return { content: [{ type: "text", text: `${managerName} is not authorized to approve leave for ${employee.name}.` }] };
  }

  const availableBalance = employee.leaveBalance[request.type];

  if (request.requestedDays > availableBalance) {
    return {
      content: [{
        type: "text",
        text: `Leave request ${leaveRequestId} cannot be approved. ${employee.name} requested ${request.requestedDays} ${request.type} day(s), but only ${availableBalance} day(s) are currently available.`,
      }],
    };
  }

  employee.leaveBalance[request.type] -= request.requestedDays;
  request.approvedDays = request.requestedDays;
  request.rejectedDays = 0;
  request.managerComment = undefined;
  request.status = "Approved";
  return { content: [{ type: "text", text: `Leave request ${leaveRequestId} has been APPROVED by ${managerName}.\nEmployee: ${employee.name}\nType: ${request.type}\nFrom: ${request.startDate} To: ${request.endDate}\nApproved days: ${request.approvedDays}\nRejected days: ${request.rejectedDays}\nRemaining ${request.type} balance: ${employee.leaveBalance[request.type]}` }] };
});

server.registerTool("partial_approve_leave", {
  title: "Partial Approve Leave",
  description: "Approve part of a pending leave request and reject the remainder",
  inputSchema: {
    leaveRequestId: z.string().describe("The leave request ID to partially approve"),
    managerName: z.string().describe("Full name of the approving manager"),
    approvedDays: z.number().int().positive().describe("How many days to approve from the original leave request"),
    rejectionReason: z.string().describe("Reason the remaining requested days are being rejected"),
  },
}, async ({ leaveRequestId, managerName, approvedDays, rejectionReason }) => {
  const manager = findManagerByName(managerName);
  if (!manager) {
    return { content: [{ type: "text", text: `Manager "${managerName}" not found.` }] };
  }

  const request = leaveRequests.find(r => r.id === leaveRequestId);
  if (!request) {
    return { content: [{ type: "text", text: `Leave request "${leaveRequestId}" not found.` }] };
  }

  if (request.status !== "Pending") {
    return { content: [{ type: "text", text: `Leave request "${leaveRequestId}" is already ${request.status}.` }] };
  }

  const employee = findPersonById(request.employeeId);
  if (!employee) {
    return { content: [{ type: "text", text: `Employee record for leave request "${leaveRequestId}" was not found.` }] };
  }

  if (!canManagerReviewEmployee(manager, employee)) {
    return { content: [{ type: "text", text: `${managerName} is not authorized to approve leave for ${employee.name}.` }] };
  }

  if (approvedDays >= request.requestedDays) {
    return { content: [{ type: "text", text: `Partial approval requires fewer than ${request.requestedDays} approved day(s). Use approve_leave to approve the full request.` }] };
  }

  const rejectedDays = request.requestedDays - approvedDays;
  const availableBalance = employee.leaveBalance[request.type];

  if (approvedDays > availableBalance) {
    return {
      content: [{
        type: "text",
        text: `Leave request ${leaveRequestId} cannot be partially approved for ${approvedDays} day(s). ${employee.name} only has ${availableBalance} ${request.type} day(s) currently available.`,
      }],
    };
  }

  employee.leaveBalance[request.type] -= approvedDays;
  request.approvedDays = approvedDays;
  request.rejectedDays = rejectedDays;
  request.managerComment = rejectionReason;
  request.status = "Partially Approved";

  return {
    content: [{
      type: "text",
      text: `Leave request ${leaveRequestId} has been PARTIALLY APPROVED by ${managerName}.\nEmployee: ${employee.name}\nType: ${request.type}\nRequested days: ${request.requestedDays}\nApproved days: ${request.approvedDays}\nRejected days: ${request.rejectedDays}\nRemaining ${request.type} balance: ${employee.leaveBalance[request.type]}\nReason for rejected days: ${rejectionReason}`,
    }],
  };
});

server.registerTool("reject_leave", {
  title: "Reject Leave",
  description: "Reject a pending leave request",
  inputSchema: {
    leaveRequestId: z.string().describe("The leave request ID to reject"),
    managerName: z.string().describe("Full name of the rejecting manager"),
    reason: z.string().describe("Reason for rejection"),
  },
}, async ({ leaveRequestId, managerName, reason }) => {
  const manager = findManagerByName(managerName);
  if (!manager) {
    return { content: [{ type: "text", text: `Manager "${managerName}" not found.` }] };
  }
  const request = leaveRequests.find(r => r.id === leaveRequestId);
  if (!request) {
    return { content: [{ type: "text", text: `Leave request "${leaveRequestId}" not found.` }] };
  }
  if (request.status !== "Pending") {
    return { content: [{ type: "text", text: `Leave request "${leaveRequestId}" is already ${request.status}.` }] };
  }
  const employee = findPersonById(request.employeeId);
  if (!employee) {
    return { content: [{ type: "text", text: `Employee record for leave request "${leaveRequestId}" was not found.` }] };
  }
  if (!canManagerReviewEmployee(manager, employee)) {
    return { content: [{ type: "text", text: `${managerName} is not authorized to reject leave for ${employee.name}.` }] };
  }
  request.approvedDays = 0;
  request.rejectedDays = request.requestedDays;
  request.managerComment = reason;
  request.status = "Rejected";
  return { content: [{ type: "text", text: `Leave request ${leaveRequestId} has been REJECTED by ${managerName}.\nEmployee: ${employee.name}\nType: ${request.type}\nFrom: ${request.startDate} To: ${request.endDate}\nRequested days: ${request.requestedDays}\nApproved days: ${request.approvedDays}\nRejected days: ${request.rejectedDays}\nReason for rejection: ${reason}` }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);