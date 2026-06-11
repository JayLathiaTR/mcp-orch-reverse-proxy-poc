import { employees, leaveRequests, managers } from "./data.js";

const people = [...employees, ...managers];

const getQueryTokens = (query: string) =>
  (query.toLowerCase().match(/[a-z]+/g) ?? []).filter(token => token.length > 2);

const findPersonByName = (name: string) =>
  people.find(person => person.name.toLowerCase() === name.toLowerCase());

const findManagerById = (id: string) =>
  managers.find(manager => manager.id === id);

const formatLeaveRequestSummary = (request: (typeof leaveRequests)[number]) => {
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

export const findKnownLeavePersonName = (query: string) => {
  return findMatchingLeavePersonNames(query)[0];
};

export const findMatchingLeavePersonNames = (query: string) => {
  const normalizedQuery = query.toLowerCase();
  const queryTokens = getQueryTokens(query);

  return people
    .filter(person => {
      const fullName = person.name.toLowerCase();
      if (normalizedQuery.includes(fullName)) {
        return true;
      }

      const nameTokens = fullName.split(/\s+/).filter(token => token.length > 2);
      return nameTokens.some(token => queryTokens.includes(token));
    })
    .map(person => person.name);
};

export const getKnownLeavePeopleNames = () => people.map(person => person.name);

const getPosition = (id: string) =>
  managers.some(manager => manager.id === id) ? "Manager" : "Employee";

export const listAllEmployeesText = () => {
  if (people.length === 0) {
    return "No employees found in the leave management system.";
  }

  const summary = people
    .map(person => `- ${person.name} (${person.id}) | Department: ${person.department} | Position: ${getPosition(person.id)}`)
    .join("\n");

  return `Employees:\n${summary}`;
};

export const listAllManagersText = () => {
  if (managers.length === 0) {
    return "No managers found in the leave management system.";
  }

  const summary = managers
    .map(manager => `- ${manager.name} (${manager.id}) | Department: ${manager.department} | Position: Manager`)
    .join("\n");

  return `Managers:\n${summary}`;
};

export const getLeaveBalanceText = (employeeName: string) => {
  const employee = findPersonByName(employeeName);
  if (!employee) {
    return `Employee "${employeeName}" not found.`;
  }

  const { Annual, Sick, Unpaid } = employee.leaveBalance;
  return `Leave balance for ${employee.name}:\n- Annual: ${Annual} days\n- Sick: ${Sick} days\n- Unpaid: ${Unpaid} days`;
};

export const getEmployeeManagerText = (employeeName: string) => {
  const employee = employees.find(person => person.name.toLowerCase() === employeeName.toLowerCase());
  if (!employee) {
    return `Employee "${employeeName}" not found.`;
  }

  const manager = findManagerById(employee.managerId);
  if (!manager) {
    return `Manager record for ${employee.name} was not found.`;
  }

  return `Manager for ${employee.name}:\n- Manager name: ${manager.name}\n- Manager ID: ${manager.id}\n- Department: ${manager.department}`;
};

export const getEmployeeProfileText = (employeeName: string) => {
  const employee = employees.find(person => person.name.toLowerCase() === employeeName.toLowerCase());
  if (!employee) {
    return `Employee "${employeeName}" not found.`;
  }

  const manager = findManagerById(employee.managerId);

  return [
    `Profile for ${employee.name}:`,
    `- Employee ID: ${employee.id}`,
    `- Department: ${employee.department}`,
    "- Position: Employee",
    `- Manager ID: ${employee.managerId}`,
    `- Manager name: ${manager?.name ?? "Unknown"}`,
  ].join("\n");
};

export const listEmployeeLeavesText = (employeeName: string) => {
  const employee = findPersonByName(employeeName);
  if (!employee) {
    return `Employee "${employeeName}" not found.`;
  }

  const requests = leaveRequests.filter(request => request.employeeId === employee.id);
  if (requests.length === 0) {
    return `No leave requests found for ${employee.name}.`;
  }

  const summary = requests.map(formatLeaveRequestSummary).join("\n");
  return `Leave requests for ${employee.name}:\n${summary}`;
};

export const getLeaveRequestCountText = (employeeName: string) => {
  const employee = findPersonByName(employeeName);
  if (!employee) {
    return `Employee "${employeeName}" not found.`;
  }

  const requestCount = leaveRequests.filter(request => request.employeeId === employee.id).length;
  return `Leave request count for ${employee.name}: ${requestCount}`;
};