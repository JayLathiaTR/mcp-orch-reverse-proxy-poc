using System.Globalization;

public sealed class LeaveManagementService
{
    private readonly List<EmployeeRecord> _employees =
    [
        new("E001", "Alice Johnson", "Engineering", "M001", new(18, 10, 5)),
        new("E002", "Bob Smith", "Engineering", "M001", new(12, 10, 5)),
        new("E003", "Carol White", "Finance", "M002", new(20, 10, 5)),
        new("E004", "Aarav Sharma", "Engineering", "M003", new(16, 10, 5)),
        new("E005", "Priya Nair", "Engineering", "M003", new(19, 10, 5)),
        new("E006", "Rohan Gupta", "Finance", "M004", new(14, 10, 5)),
        new("E007", "Sneha Iyer", "Finance", "M004", new(17, 10, 5)),
        new("E008", "Vikram Reddy", "HR", "M005", new(18, 10, 5)),
        new("E009", "Kavya Menon", "HR", "M005", new(15, 10, 5)),
        new("E010", "Sofia Martinez", "Engineering", "M006", new(18, 10, 5)),
        new("E011", "Diego Ramirez", "Engineering", "M006", new(16, 10, 5)),
        new("E012", "Valeria Gomez", "Finance", "M007", new(19, 10, 5)),
        new("E013", "Mateo Herrera", "Finance", "M007", new(15, 10, 5)),
        new("E014", "Camila Torres", "HR", "M005", new(17, 10, 5)),
    ];

    private readonly List<EmployeeRecord> _managers =
    [
        new("M001", "David Lee", "Engineering", string.Empty, new(20, 10, 5)),
        new("M002", "Eva Brown", "Finance", string.Empty, new(20, 10, 5)),
        new("M003", "Arjun Mehta", "Engineering", string.Empty, new(20, 10, 5)),
        new("M004", "Neha Kapoor", "Finance", string.Empty, new(20, 10, 5)),
        new("M005", "Rahul Verma", "HR", string.Empty, new(20, 10, 5)),
        new("M006", "Alejandro Cruz", "Engineering", string.Empty, new(20, 10, 5)),
        new("M007", "Fernanda Reyes", "Finance", string.Empty, new(20, 10, 5)),
    ];

    private readonly List<LeaveRequestRecord> _leaveRequests = [];

    private IEnumerable<EmployeeRecord> People => _employees.Concat(_managers);

    public string ListAllEmployeesText()
    {
        var summary = People
            .Select(person => $"- {person.Name} ({person.Id}) | Department: {person.Department} | Position: {GetPosition(person.Id)}")
            .ToArray();

        return summary.Length == 0
            ? "No employees found in the leave management system."
            : $"Employees:\n{string.Join("\n", summary)}";
    }

    public string ListAllManagersText()
    {
        var summary = _managers
            .Select(manager => $"- {manager.Name} ({manager.Id}) | Department: {manager.Department} | Position: Manager")
            .ToArray();

        return summary.Length == 0
            ? "No managers found in the leave management system."
            : $"Managers:\n{string.Join("\n", summary)}";
    }

    public string CheckLeaveBalanceText(string employeeName)
    {
        var employee = FindPersonByName(employeeName);
        if (employee is null)
        {
            return $"Employee \"{employeeName}\" not found.";
        }

        return $"Leave balance for {employee.Name}:\n- Annual: {employee.LeaveBalance.Annual} days\n- Sick: {employee.LeaveBalance.Sick} days\n- Unpaid: {employee.LeaveBalance.Unpaid} days";
    }

    public string GetEmployeeManagerText(string employeeName)
    {
        var employee = _employees.FirstOrDefault(person => person.Name.Equals(employeeName, StringComparison.OrdinalIgnoreCase));
        if (employee is null)
        {
            return $"Employee \"{employeeName}\" not found.";
        }

        var manager = FindManagerById(employee.ManagerId);
        if (manager is null)
        {
            return $"Manager record for {employee.Name} was not found.";
        }

        return $"Manager for {employee.Name}:\n- Manager name: {manager.Name}\n- Manager ID: {manager.Id}\n- Department: {manager.Department}";
    }

    public string GetEmployeeProfileText(string employeeName)
    {
        var employee = _employees.FirstOrDefault(person => person.Name.Equals(employeeName, StringComparison.OrdinalIgnoreCase));
        if (employee is null)
        {
            return $"Employee \"{employeeName}\" not found.";
        }

        var manager = FindManagerById(employee.ManagerId);
        return string.Join("\n",
        [
            $"Profile for {employee.Name}:",
            $"- Employee ID: {employee.Id}",
            $"- Department: {employee.Department}",
            "- Position: Employee",
            $"- Manager ID: {employee.ManagerId}",
            $"- Manager name: {manager?.Name ?? "Unknown"}",
        ]);
    }

    public string ApplyLeaveText(string employeeName, string leaveType, string startDate, string endDate, string reason)
    {
        var employee = FindPersonByName(employeeName);
        if (employee is null)
        {
            return $"Employee \"{employeeName}\" not found.";
        }

        if (!TryNormalizeLeaveType(leaveType, out var normalizedLeaveType))
        {
            return $"Unknown leave type \"{leaveType}\". Supported values are Annual, Sick, and Unpaid.";
        }

        var leaveDuration = GetLeaveDuration(startDate, endDate);
        if (!leaveDuration.IsValid)
        {
            return $"Unable to submit leave request: {leaveDuration.ErrorMessage}";
        }

        var availableBalance = employee.LeaveBalance.GetBalance(normalizedLeaveType);
        if (leaveDuration.Days > availableBalance)
        {
            return $"Unable to submit leave request for {employee.Name}. Requested {leaveDuration.Days} {normalizedLeaveType} day(s), but only {availableBalance} day(s) are available.";
        }

        var requestId = $"LR{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        _leaveRequests.Add(new LeaveRequestRecord(
            requestId,
            employee.Id,
            normalizedLeaveType,
            startDate,
            endDate,
            leaveDuration.Days,
            0,
            0,
            reason,
            null,
            "Pending"));

        return $"Leave request submitted!\nID: {requestId}\nEmployee: {employee.Name}\nType: {normalizedLeaveType}\nFrom: {startDate} To: {endDate}\nRequested days: {leaveDuration.Days}\nAvailable balance: {availableBalance}\nStatus: Pending";
    }

    public string ListEmployeeLeavesText(string employeeName)
    {
        var employee = FindPersonByName(employeeName);
        if (employee is null)
        {
            return $"Employee \"{employeeName}\" not found.";
        }

        var requests = _leaveRequests.Where(request => request.EmployeeId == employee.Id).ToArray();
        if (requests.Length == 0)
        {
            return $"No leave requests found for {employee.Name}.";
        }

        var summary = requests.Select(FormatLeaveRequestSummary);
        return $"Leave requests for {employee.Name}:\n{string.Join("\n", summary)}";
    }

    public string ListPendingApprovalsText(string managerName)
    {
        var manager = FindManagerByName(managerName);
        if (manager is null)
        {
            return $"Manager \"{managerName}\" not found.";
        }

        var teamIds = _employees.Where(employee => employee.ManagerId == manager.Id).Select(employee => employee.Id).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var pending = _leaveRequests.Where(request => teamIds.Contains(request.EmployeeId) && request.Status == "Pending").ToArray();
        if (pending.Length == 0)
        {
            return $"No pending leave requests for {managerName}'s team.";
        }

        var summary = pending.Select(request => $"{FormatLeaveRequestSummary(request)} | Employee: {FindPersonById(request.EmployeeId)?.Name ?? request.EmployeeId}");
        return $"Pending approvals for {managerName}:\n{string.Join("\n", summary)}";
    }

    public string ApproveLeaveText(string leaveRequestId, string managerName)
    {
        var validation = ValidatePendingRequestForManager(leaveRequestId, managerName);
        if (!validation.IsValid)
        {
            return validation.ErrorMessage!;
        }

        var employee = validation.Employee!;
        var request = validation.Request!;
        var availableBalance = employee.LeaveBalance.GetBalance(request.Type);
        if (request.RequestedDays > availableBalance)
        {
            return $"Leave request {leaveRequestId} cannot be approved. {employee.Name} requested {request.RequestedDays} {request.Type} day(s), but only {availableBalance} day(s) are currently available.";
        }

        employee.LeaveBalance.Deduct(request.Type, request.RequestedDays);
        request.ApprovedDays = request.RequestedDays;
        request.RejectedDays = 0;
        request.ManagerComment = null;
        request.Status = "Approved";

        return $"Leave request {leaveRequestId} has been APPROVED by {managerName}.\nEmployee: {employee.Name}\nType: {request.Type}\nFrom: {request.StartDate} To: {request.EndDate}\nApproved days: {request.ApprovedDays}\nRejected days: {request.RejectedDays}\nRemaining {request.Type} balance: {employee.LeaveBalance.GetBalance(request.Type)}";
    }

    public string PartialApproveLeaveText(string leaveRequestId, string managerName, int approvedDays, string rejectionReason)
    {
        var validation = ValidatePendingRequestForManager(leaveRequestId, managerName);
        if (!validation.IsValid)
        {
            return validation.ErrorMessage!;
        }

        var employee = validation.Employee!;
        var request = validation.Request!;

        if (approvedDays >= request.RequestedDays)
        {
            return $"Partial approval requires fewer than {request.RequestedDays} approved day(s). Use approve_leave to approve the full request.";
        }

        var availableBalance = employee.LeaveBalance.GetBalance(request.Type);
        if (approvedDays > availableBalance)
        {
            return $"Leave request {leaveRequestId} cannot be partially approved for {approvedDays} day(s). {employee.Name} only has {availableBalance} {request.Type} day(s) currently available.";
        }

        employee.LeaveBalance.Deduct(request.Type, approvedDays);
        request.ApprovedDays = approvedDays;
        request.RejectedDays = request.RequestedDays - approvedDays;
        request.ManagerComment = rejectionReason;
        request.Status = "Partially Approved";

        return $"Leave request {leaveRequestId} has been PARTIALLY APPROVED by {managerName}.\nEmployee: {employee.Name}\nType: {request.Type}\nRequested days: {request.RequestedDays}\nApproved days: {request.ApprovedDays}\nRejected days: {request.RejectedDays}\nRemaining {request.Type} balance: {employee.LeaveBalance.GetBalance(request.Type)}\nReason for rejected days: {rejectionReason}";
    }

    public string RejectLeaveText(string leaveRequestId, string managerName, string reason)
    {
        var validation = ValidatePendingRequestForManager(leaveRequestId, managerName);
        if (!validation.IsValid)
        {
            return validation.ErrorMessage!;
        }

        var employee = validation.Employee!;
        var request = validation.Request!;
        request.ApprovedDays = 0;
        request.RejectedDays = request.RequestedDays;
        request.ManagerComment = reason;
        request.Status = "Rejected";

        return $"Leave request {leaveRequestId} has been REJECTED by {managerName}.\nEmployee: {employee.Name}\nType: {request.Type}\nFrom: {request.StartDate} To: {request.EndDate}\nRequested days: {request.RequestedDays}\nApproved days: {request.ApprovedDays}\nRejected days: {request.RejectedDays}\nReason for rejection: {reason}";
    }

    private EmployeeRecord? FindPersonByName(string name) => People.FirstOrDefault(person => person.Name.Equals(name, StringComparison.OrdinalIgnoreCase));

    private EmployeeRecord? FindPersonById(string id) => People.FirstOrDefault(person => person.Id.Equals(id, StringComparison.OrdinalIgnoreCase));

    private EmployeeRecord? FindManagerById(string id) => _managers.FirstOrDefault(manager => manager.Id.Equals(id, StringComparison.OrdinalIgnoreCase));

    private EmployeeRecord? FindManagerByName(string name) => _managers.FirstOrDefault(manager => manager.Name.Equals(name, StringComparison.OrdinalIgnoreCase));

    private string GetPosition(string id) => _managers.Any(manager => manager.Id.Equals(id, StringComparison.OrdinalIgnoreCase)) ? "Manager" : "Employee";

    private static bool TryNormalizeLeaveType(string leaveType, out string normalizedLeaveType)
    {
        normalizedLeaveType = CultureInfo.InvariantCulture.TextInfo.ToTitleCase(leaveType.Trim().ToLowerInvariant());
        return normalizedLeaveType is "Annual" or "Sick" or "Unpaid";
    }

    private static LeaveDurationResult GetLeaveDuration(string startDate, string endDate)
    {
        if (!DateOnly.TryParseExact(startDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var start)
            || !DateOnly.TryParseExact(endDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var end))
        {
            return LeaveDurationResult.Invalid("Dates must be provided in YYYY-MM-DD format.");
        }

        if (end < start)
        {
            return LeaveDurationResult.Invalid("End date cannot be earlier than start date.");
        }

        return LeaveDurationResult.Valid(end.DayNumber - start.DayNumber + 1);
    }

    private RequestValidationResult ValidatePendingRequestForManager(string leaveRequestId, string managerName)
    {
        var manager = FindManagerByName(managerName);
        if (manager is null)
        {
            return RequestValidationResult.Fail($"Manager \"{managerName}\" not found.");
        }

        var request = _leaveRequests.FirstOrDefault(item => item.Id.Equals(leaveRequestId, StringComparison.OrdinalIgnoreCase));
        if (request is null)
        {
            return RequestValidationResult.Fail($"Leave request \"{leaveRequestId}\" not found.");
        }

        if (request.Status != "Pending")
        {
            return RequestValidationResult.Fail($"Leave request \"{leaveRequestId}\" is already {request.Status}.");
        }

        var employee = FindPersonById(request.EmployeeId);
        if (employee is null)
        {
            return RequestValidationResult.Fail($"Employee record for leave request \"{leaveRequestId}\" was not found.");
        }

        if (!employee.ManagerId.Equals(manager.Id, StringComparison.OrdinalIgnoreCase))
        {
            return RequestValidationResult.Fail($"{managerName} is not authorized to approve leave for {employee.Name}.");
        }

        return RequestValidationResult.Success(manager, employee, request);
    }

    private static string FormatLeaveRequestSummary(LeaveRequestRecord request)
    {
        var summaryParts = new List<string>
        {
            $"- [{request.Id}] {request.Type}",
            $"{request.StartDate} to {request.EndDate}",
            request.Status,
            $"Requested: {request.RequestedDays} day(s)",
        };

        if (request.ApprovedDays > 0)
        {
            summaryParts.Add($"Approved: {request.ApprovedDays} day(s)");
        }

        if (request.RejectedDays > 0)
        {
            summaryParts.Add($"Rejected: {request.RejectedDays} day(s)");
        }

        summaryParts.Add($"Reason: {request.Reason}");

        if (!string.IsNullOrWhiteSpace(request.ManagerComment))
        {
            summaryParts.Add($"Manager comment: {request.ManagerComment}");
        }

        return string.Join(" | ", summaryParts);
    }
}

public sealed record EmployeeRecord(string Id, string Name, string Department, string ManagerId, LeaveBalance LeaveBalance);

public sealed class LeaveBalance(int annual, int sick, int unpaid)
{
    public int Annual { get; set; } = annual;

    public int Sick { get; set; } = sick;

    public int Unpaid { get; set; } = unpaid;

    public int GetBalance(string leaveType) => leaveType switch
    {
        "Annual" => Annual,
        "Sick" => Sick,
        "Unpaid" => Unpaid,
        _ => throw new InvalidOperationException($"Unsupported leave type {leaveType}.")
    };

    public void Deduct(string leaveType, int days)
    {
        switch (leaveType)
        {
            case "Annual":
                Annual -= days;
                break;
            case "Sick":
                Sick -= days;
                break;
            case "Unpaid":
                Unpaid -= days;
                break;
            default:
                throw new InvalidOperationException($"Unsupported leave type {leaveType}.");
        }
    }
}

public sealed class LeaveRequestRecord(
    string id,
    string employeeId,
    string type,
    string startDate,
    string endDate,
    int requestedDays,
    int approvedDays,
    int rejectedDays,
    string reason,
    string? managerComment,
    string status)
{
    public string Id { get; } = id;

    public string EmployeeId { get; } = employeeId;

    public string Type { get; } = type;

    public string StartDate { get; } = startDate;

    public string EndDate { get; } = endDate;

    public int RequestedDays { get; } = requestedDays;

    public int ApprovedDays { get; set; } = approvedDays;

    public int RejectedDays { get; set; } = rejectedDays;

    public string Reason { get; } = reason;

    public string? ManagerComment { get; set; } = managerComment;

    public string Status { get; set; } = status;
}

public sealed record LeaveDurationResult(bool IsValid, int Days, string? ErrorMessage)
{
    public static LeaveDurationResult Valid(int days) => new(true, days, null);

    public static LeaveDurationResult Invalid(string errorMessage) => new(false, 0, errorMessage);
}

public sealed record RequestValidationResult(bool IsValid, string? ErrorMessage, EmployeeRecord? Manager, EmployeeRecord? Employee, LeaveRequestRecord? Request)
{
    public static RequestValidationResult Success(EmployeeRecord manager, EmployeeRecord employee, LeaveRequestRecord request)
        => new(true, null, manager, employee, request);

    public static RequestValidationResult Fail(string errorMessage)
        => new(false, errorMessage, null, null, null);
}