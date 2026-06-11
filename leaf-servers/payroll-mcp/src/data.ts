export interface PayrollRecord {
  employeeName: string;
  employeeId: string;
  currency: string;
  grossMonthlyPay: number;
  netMonthlyPay: number;
  lastPayDate: string;
  payComponents: string[];
}

export const payrollRecords: PayrollRecord[] = [
  {
    employeeName: "Aarav Sharma",
    employeeId: "E004",
    currency: "INR",
    grossMonthlyPay: 185000,
    netMonthlyPay: 143000,
    lastPayDate: "2026-05-31",
    payComponents: ["Base Pay", "Bonus", "Provident Fund", "Tax"]
  },
  {
    employeeName: "Priya Nair",
    employeeId: "E005",
    currency: "INR",
    grossMonthlyPay: 210000,
    netMonthlyPay: 161000,
    lastPayDate: "2026-05-31",
    payComponents: ["Base Pay", "Performance Bonus", "Provident Fund", "Tax"]
  },
  {
    employeeName: "Sofia Martinez",
    employeeId: "E010",
    currency: "MXN",
    grossMonthlyPay: 72000,
    netMonthlyPay: 56900,
    lastPayDate: "2026-05-30",
    payComponents: ["Base Pay", "Transport Allowance", "Tax", "Social Security"]
  },
  {
    employeeName: "Valeria Gomez",
    employeeId: "E012",
    currency: "MXN",
    grossMonthlyPay: 68000,
    netMonthlyPay: 53400,
    lastPayDate: "2026-05-30",
    payComponents: ["Base Pay", "Tax", "Social Security", "Food Vouchers"]
  }
];
