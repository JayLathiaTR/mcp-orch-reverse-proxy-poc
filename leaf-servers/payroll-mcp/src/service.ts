import { payrollRecords } from "./data.js";

export const getPayrollSummaryText = (employeeName: string) => {
  const record = payrollRecords.find(entry => entry.employeeName.toLowerCase() === employeeName.toLowerCase());
  if (!record) {
    return `No payroll summary found for ${employeeName}.`;
  }

  return `Payroll summary for ${record.employeeName}:\n- Employee ID: ${record.employeeId}\n- Gross monthly pay: ${record.currency} ${record.grossMonthlyPay}\n- Net monthly pay: ${record.currency} ${record.netMonthlyPay}\n- Last pay date: ${record.lastPayDate}`;
};

export const getLastPayDateText = (employeeName: string) => {
  const record = payrollRecords.find(entry => entry.employeeName.toLowerCase() === employeeName.toLowerCase());
  if (!record) {
    return `No payroll date found for ${employeeName}.`;
  }

  return `The last pay date for ${record.employeeName} was ${record.lastPayDate}.`;
};

export const getPayComponentsText = (employeeName: string) => {
  const record = payrollRecords.find(entry => entry.employeeName.toLowerCase() === employeeName.toLowerCase());
  if (!record) {
    return `No pay components found for ${employeeName}.`;
  }

  return `Pay components for ${record.employeeName}:\n- ${record.payComponents.join("\n- ")}`;
};