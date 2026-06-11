import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import { payrollRecords } from "./data.js";

const server = new McpServer({
  name: "payroll-mcp",
  version: "1.0.0",
});

const getPayrollSummaryText = (employeeName: string) => {
  const record = payrollRecords.find(entry => entry.employeeName.toLowerCase() === employeeName.toLowerCase());
  if (!record) {
    return `No payroll summary found for ${employeeName}.`;
  }

  return `Payroll summary for ${record.employeeName}:\n- Employee ID: ${record.employeeId}\n- Gross monthly pay: ${record.currency} ${record.grossMonthlyPay}\n- Net monthly pay: ${record.currency} ${record.netMonthlyPay}\n- Last pay date: ${record.lastPayDate}`;
};

const getLastPayDateText = (employeeName: string) => {
  const record = payrollRecords.find(entry => entry.employeeName.toLowerCase() === employeeName.toLowerCase());
  if (!record) {
    return `No payroll date found for ${employeeName}.`;
  }

  return `The last pay date for ${record.employeeName} was ${record.lastPayDate}.`;
};

const getPayComponentsText = (employeeName: string) => {
  const record = payrollRecords.find(entry => entry.employeeName.toLowerCase() === employeeName.toLowerCase());
  if (!record) {
    return `No pay components found for ${employeeName}.`;
  }

  return `Pay components for ${record.employeeName}:\n- ${record.payComponents.join("\n- ")}`;
};

server.registerTool("get_payroll_summary", {
  title: "Get Payroll Summary",
  description: "Get a monthly payroll summary for an employee",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => {
  return {
    content: [{ type: "text", text: getPayrollSummaryText(employeeName) }],
  };
});

server.registerTool("get_employee_payroll_summary", {
  title: "Get Employee Payroll Summary",
  description: "Get a monthly payroll summary for an employee using a clearer tool name",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => ({
  content: [{ type: "text", text: getPayrollSummaryText(employeeName) }],
}));

server.registerTool("get_last_pay_date", {
  title: "Get Last Pay Date",
  description: "Return the most recent payroll date for an employee",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => {
  return {
    content: [{ type: "text", text: getLastPayDateText(employeeName) }],
  };
});

server.registerTool("get_employee_last_pay_date", {
  title: "Get Employee Last Pay Date",
  description: "Return the most recent payroll date for an employee using a clearer tool name",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => ({
  content: [{ type: "text", text: getLastPayDateText(employeeName) }],
}));

server.registerTool("list_pay_components", {
  title: "List Pay Components",
  description: "List the payroll components used for an employee",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => {
  return {
    content: [{ type: "text", text: getPayComponentsText(employeeName) }],
  };
});

server.registerTool("list_employee_pay_components", {
  title: "List Employee Pay Components",
  description: "List the payroll components used for an employee using a clearer tool name",
  inputSchema: {
    employeeName: z.string().describe("Full name of the employee"),
  },
}, async ({ employeeName }) => ({
  content: [{ type: "text", text: getPayComponentsText(employeeName) }],
}));

const transport = new StdioServerTransport();
await server.connect(transport);
