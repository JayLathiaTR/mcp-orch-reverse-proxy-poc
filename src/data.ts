export type LeaveType = "Annual" | "Sick" | "Unpaid";
export type LeaveStatus = "Pending" | "Approved" | "Partially Approved" | "Rejected";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  requestedDays: number;
  approvedDays: number;
  rejectedDays: number;
  reason: string;
  managerComment?: string;
  status: LeaveStatus;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  managerId: string;
  leaveBalance: {
    Annual: number;
    Sick: number;
    Unpaid: number;
  };
}

export const employees: Employee[] = [
  { id: "E001", name: "Alice Johnson", department: "Engineering", managerId: "M001", leaveBalance: { Annual: 18, Sick: 10, Unpaid: 5 } },
  { id: "E002", name: "Bob Smith",     department: "Engineering", managerId: "M001", leaveBalance: { Annual: 12, Sick: 10, Unpaid: 5 } },
  { id: "E003", name: "Carol White",   department: "Finance",     managerId: "M002", leaveBalance: { Annual: 20, Sick: 10, Unpaid: 5 } },
  { id: "E004", name: "Aarav Sharma",  department: "Engineering", managerId: "M003", leaveBalance: { Annual: 16, Sick: 10, Unpaid: 5 } },
  { id: "E005", name: "Priya Nair",    department: "Engineering", managerId: "M003", leaveBalance: { Annual: 19, Sick: 10, Unpaid: 5 } },
  { id: "E006", name: "Rohan Gupta",   department: "Finance",     managerId: "M004", leaveBalance: { Annual: 14, Sick: 10, Unpaid: 5 } },
  { id: "E007", name: "Sneha Iyer",    department: "Finance",     managerId: "M004", leaveBalance: { Annual: 17, Sick: 10, Unpaid: 5 } },
  { id: "E008", name: "Vikram Reddy",  department: "HR",          managerId: "M005", leaveBalance: { Annual: 18, Sick: 10, Unpaid: 5 } },
  { id: "E009", name: "Kavya Menon",   department: "HR",          managerId: "M005", leaveBalance: { Annual: 15, Sick: 10, Unpaid: 5 } },
  { id: "E010", name: "Sofia Martinez", department: "Engineering", managerId: "M006", leaveBalance: { Annual: 18, Sick: 10, Unpaid: 5 } },
  { id: "E011", name: "Diego Ramirez",  department: "Engineering", managerId: "M006", leaveBalance: { Annual: 16, Sick: 10, Unpaid: 5 } },
  { id: "E012", name: "Valeria Gomez",  department: "Finance",     managerId: "M007", leaveBalance: { Annual: 19, Sick: 10, Unpaid: 5 } },
  { id: "E013", name: "Mateo Herrera",  department: "Finance",     managerId: "M007", leaveBalance: { Annual: 15, Sick: 10, Unpaid: 5 } },
  { id: "E014", name: "Camila Torres",  department: "HR",          managerId: "M005", leaveBalance: { Annual: 17, Sick: 10, Unpaid: 5 } },
];

export const managers: Employee[] = [
  { id: "M001", name: "David Lee",   department: "Engineering", managerId: "", leaveBalance: { Annual: 20, Sick: 10, Unpaid: 5 } },
  { id: "M002", name: "Eva Brown",   department: "Finance",     managerId: "", leaveBalance: { Annual: 20, Sick: 10, Unpaid: 5 } },
  { id: "M003", name: "Arjun Mehta", department: "Engineering", managerId: "", leaveBalance: { Annual: 20, Sick: 10, Unpaid: 5 } },
  { id: "M004", name: "Neha Kapoor", department: "Finance",     managerId: "", leaveBalance: { Annual: 20, Sick: 10, Unpaid: 5 } },
  { id: "M005", name: "Rahul Verma", department: "HR",          managerId: "", leaveBalance: { Annual: 20, Sick: 10, Unpaid: 5 } },
  { id: "M006", name: "Alejandro Cruz", department: "Engineering", managerId: "", leaveBalance: { Annual: 20, Sick: 10, Unpaid: 5 } },
  { id: "M007", name: "Fernanda Reyes", department: "Finance",     managerId: "", leaveBalance: { Annual: 20, Sick: 10, Unpaid: 5 } },
];

export const leaveRequests: LeaveRequest[] = [];