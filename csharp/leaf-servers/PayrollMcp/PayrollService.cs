public sealed class PayrollService
{
    private readonly List<PayrollRecord> _records =
    [
        new("Aarav Sharma", "E004", "INR", 185000, 143000, "2026-05-31", ["Base Pay", "Bonus", "Provident Fund", "Tax"]),
        new("Priya Nair", "E005", "INR", 210000, 161000, "2026-05-31", ["Base Pay", "Performance Bonus", "Provident Fund", "Tax"]),
        new("Sofia Martinez", "E010", "MXN", 72000, 56900, "2026-05-30", ["Base Pay", "Transport Allowance", "Tax", "Social Security"]),
        new("Valeria Gomez", "E012", "MXN", 68000, 53400, "2026-05-30", ["Base Pay", "Tax", "Social Security", "Food Vouchers"]),
    ];

    public string GetPayrollSummaryText(string employeeName)
    {
        var record = FindRecord(employeeName);
        if (record is null)
        {
            return $"No payroll summary found for {employeeName}.";
        }

        return $"Payroll summary for {record.EmployeeName}:\n- Employee ID: {record.EmployeeId}\n- Gross monthly pay: {record.Currency} {record.GrossMonthlyPay}\n- Net monthly pay: {record.Currency} {record.NetMonthlyPay}\n- Last pay date: {record.LastPayDate}";
    }

    public string GetLastPayDateText(string employeeName)
    {
        var record = FindRecord(employeeName);
        return record is null
            ? $"No payroll date found for {employeeName}."
            : $"The last pay date for {record.EmployeeName} was {record.LastPayDate}.";
    }

    public string GetPayComponentsText(string employeeName)
    {
        var record = FindRecord(employeeName);
        return record is null
            ? $"No pay components found for {employeeName}."
            : $"Pay components for {record.EmployeeName}:\n- {string.Join("\n- ", record.PayComponents)}";
    }

    private PayrollRecord? FindRecord(string employeeName)
        => _records.FirstOrDefault(entry => entry.EmployeeName.Equals(employeeName, StringComparison.OrdinalIgnoreCase));
}

public sealed record PayrollRecord(
    string EmployeeName,
    string EmployeeId,
    string Currency,
    decimal GrossMonthlyPay,
    decimal NetMonthlyPay,
    string LastPayDate,
    string[] PayComponents);