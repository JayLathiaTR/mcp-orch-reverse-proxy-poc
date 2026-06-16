using McpOrch.Common.Infrastructure;
using McpOrch.Common.Models;

public sealed class HrDomainService : IAsyncDisposable
{
    private static readonly LeafServerInfo[] LeafServers =
    [
        new(
            "leave-management-mcp",
            "Leave balances, leave requests, approvals, and manager review flows",
            ["list_all_employees", "list_all_managers", "check_leave_balance", "get_employee_manager", "get_employee_profile", "apply_leave", "list_employee_leaves", "list_pending_approvals", "approve_leave", "partial_approve_leave", "reject_leave"]),
        new(
            "payroll-mcp",
            "Payroll summaries, last pay dates, and pay component lookups",
            ["get_payroll_summary", "get_last_pay_date", "list_pay_components"]),
    ];

    private readonly McpLeafProxyClient _leaveManagementProxy = new(
        "leave-management-mcp",
        RepoPaths.GetProjectPath("leaf-servers/LeaveManagementMcp/LeaveManagementMcp.csproj"));

    private readonly McpLeafProxyClient _payrollProxy = new(
        "payroll-mcp",
        RepoPaths.GetProjectPath("leaf-servers/PayrollMcp/PayrollMcp.csproj"));

    public Task<string> ListAllEmployeesAsync(CancellationToken cancellationToken = default)
        => _leaveManagementProxy.CallTextToolAsync("list_all_employees", cancellationToken: cancellationToken);

    public Task<string> ListAllManagersAsync(CancellationToken cancellationToken = default)
        => _leaveManagementProxy.CallTextToolAsync("list_all_managers", cancellationToken: cancellationToken);

    public Task<string> CheckLeaveBalanceAsync(string employeeName, CancellationToken cancellationToken = default)
        => _leaveManagementProxy.CallTextToolAsync("check_leave_balance", new Dictionary<string, object?> { ["employeeName"] = employeeName }, cancellationToken);

    public Task<string> GetEmployeeManagerAsync(string employeeName, CancellationToken cancellationToken = default)
        => _leaveManagementProxy.CallTextToolAsync("get_employee_manager", new Dictionary<string, object?> { ["employeeName"] = employeeName }, cancellationToken);

    public Task<string> GetEmployeeProfileAsync(string employeeName, CancellationToken cancellationToken = default)
        => _leaveManagementProxy.CallTextToolAsync("get_employee_profile", new Dictionary<string, object?> { ["employeeName"] = employeeName }, cancellationToken);

    public Task<string> ApplyLeaveAsync(string employeeName, string leaveType, string startDate, string endDate, string reason, CancellationToken cancellationToken = default)
        => _leaveManagementProxy.CallTextToolAsync("apply_leave", new Dictionary<string, object?>
        {
            ["employeeName"] = employeeName,
            ["leaveType"] = leaveType,
            ["startDate"] = startDate,
            ["endDate"] = endDate,
            ["reason"] = reason,
        }, cancellationToken);

    public Task<string> ListEmployeeLeavesAsync(string employeeName, CancellationToken cancellationToken = default)
        => _leaveManagementProxy.CallTextToolAsync("list_employee_leaves", new Dictionary<string, object?> { ["employeeName"] = employeeName }, cancellationToken);

    public Task<string> ListPendingApprovalsAsync(string managerName, CancellationToken cancellationToken = default)
        => _leaveManagementProxy.CallTextToolAsync("list_pending_approvals", new Dictionary<string, object?> { ["managerName"] = managerName }, cancellationToken);

    public Task<string> ApproveLeaveAsync(string leaveRequestId, string managerName, CancellationToken cancellationToken = default)
        => _leaveManagementProxy.CallTextToolAsync("approve_leave", new Dictionary<string, object?>
        {
            ["leaveRequestId"] = leaveRequestId,
            ["managerName"] = managerName,
        }, cancellationToken);

    public Task<string> PartialApproveLeaveAsync(string leaveRequestId, string managerName, int approvedDays, string rejectionReason, CancellationToken cancellationToken = default)
        => _leaveManagementProxy.CallTextToolAsync("partial_approve_leave", new Dictionary<string, object?>
        {
            ["leaveRequestId"] = leaveRequestId,
            ["managerName"] = managerName,
            ["approvedDays"] = approvedDays,
            ["rejectionReason"] = rejectionReason,
        }, cancellationToken);

    public Task<string> RejectLeaveAsync(string leaveRequestId, string managerName, string reason, CancellationToken cancellationToken = default)
        => _leaveManagementProxy.CallTextToolAsync("reject_leave", new Dictionary<string, object?>
        {
            ["leaveRequestId"] = leaveRequestId,
            ["managerName"] = managerName,
            ["reason"] = reason,
        }, cancellationToken);

    public Task<string> GetPayrollSummaryAsync(string employeeName, CancellationToken cancellationToken = default)
        => _payrollProxy.CallTextToolAsync("get_payroll_summary", new Dictionary<string, object?> { ["employeeName"] = employeeName }, cancellationToken);

    public Task<string> GetLastPayDateAsync(string employeeName, CancellationToken cancellationToken = default)
        => _payrollProxy.CallTextToolAsync("get_last_pay_date", new Dictionary<string, object?> { ["employeeName"] = employeeName }, cancellationToken);

    public Task<string> ListPayComponentsAsync(string employeeName, CancellationToken cancellationToken = default)
        => _payrollProxy.CallTextToolAsync("list_pay_components", new Dictionary<string, object?> { ["employeeName"] = employeeName }, cancellationToken);

    public string ListHrLeafServersText()
        => $"HR domain leaf MCP servers:\n{string.Join("\n", LeafServers.Select(server => $"- {server.Name}: {server.Purpose}"))}";

    public string ListHrToolsText()
        => $"Tools exposed by the HR domain proxy:\n{string.Join("\n", LeafServers.Select(server => $"- {server.Name}: {string.Join(", ", server.Tools)}"))}";

    public async Task<string> HandleHrRequestAsync(string userRequest, string? employeeOverride = null, CancellationToken cancellationToken = default)
    {
        var normalizedRequest = userRequest.ToLowerInvariant();
        var personMatches = employeeOverride is not null
            ? new[] { employeeOverride }
            : await FindHrPeopleMatchesAsync(userRequest, cancellationToken);
        var managerMatches = await FindHrManagerMatchesAsync(userRequest, cancellationToken);

        if (employeeOverride is null && personMatches.Count > 1)
        {
            return $"I found multiple employees in the HR domain matching your request:\n- {string.Join("\n- ", personMatches)}\nWhich employee do you want details for?";
        }

        if (managerMatches.Count > 1)
        {
            return $"I found multiple managers in the HR domain matching your request:\n- {string.Join("\n- ", managerMatches)}\nWhich manager do you want to use?";
        }

        var personName = personMatches.FirstOrDefault();
        var managerName = managerMatches.FirstOrDefault();

        if (ContainsAny(normalizedRequest, "all employees", "list employees", "list all employees"))
        {
            return await ListAllEmployeesAsync(cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "all managers", "list managers", "list all managers"))
        {
            return await ListAllManagersAsync(cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "leave request count", "how many leave requests", "number of leave requests") && personName is not null)
        {
            var leaveHistoryText = await ListEmployeeLeavesAsync(personName, cancellationToken);
            var requestCount = leaveHistoryText.StartsWith("No leave requests found for ", StringComparison.OrdinalIgnoreCase)
                ? 0
                : leaveHistoryText.Split('\n').Count(line => line.StartsWith("- [", StringComparison.Ordinal));
            return $"Leave request count for {personName}: {requestCount}";
        }

        if (ContainsAny(normalizedRequest, "leave requests", "employee leaves", "leave history") && personName is not null)
        {
            return await ListEmployeeLeavesAsync(personName, cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "leave balance", "leave remaining") && personName is not null)
        {
            return await CheckLeaveBalanceAsync(personName, cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "manager", "reports to", "reporting manager") && personName is not null)
        {
            return await GetEmployeeManagerAsync(personName, cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "profile", "manager id") && personName is not null)
        {
            return await GetEmployeeProfileAsync(personName, cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "pending approvals", "pending leaves") && managerName is not null)
        {
            return await ListPendingApprovalsAsync(managerName, cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "last pay date", "pay date") && personName is not null)
        {
            return await GetLastPayDateAsync(personName, cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "pay components", "salary components", "compensation components") && personName is not null)
        {
            return await ListPayComponentsAsync(personName, cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "payroll", "salary", "compensation") && personName is not null)
        {
            return await GetPayrollSummaryAsync(personName, cancellationToken);
        }

        if (personName is not null && IsGenericEmployeeIntent(normalizedRequest))
        {
            return $"I found {personName} in HR data. Which detail do you want?\n- Manager\n- Employee profile\n- Leave balance\n- Leave history\n- Leave request count\n- Payroll summary\n- Last pay date\n- Pay components";
        }

        return $"{ListHrToolsText()}\n- HR domain note: The request did not map cleanly to one leave or payroll tool.";
    }

    private async Task<IReadOnlyList<string>> FindHrPeopleMatchesAsync(string request, CancellationToken cancellationToken)
        => FindMatchingNames(request, ExtractPeopleNames(await ListAllEmployeesAsync(cancellationToken)));

    private async Task<IReadOnlyList<string>> FindHrManagerMatchesAsync(string request, CancellationToken cancellationToken)
        => FindMatchingNames(request, ExtractPeopleNames(await ListAllManagersAsync(cancellationToken)));

    private static List<string> ExtractPeopleNames(string text)
        => text.Split('\n')
            .Where(line => line.StartsWith("- ", StringComparison.Ordinal))
            .Select(line => line.Split(" (", StringSplitOptions.None)[0].Replace("- ", string.Empty, StringComparison.Ordinal))
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .ToList();

    private static IReadOnlyList<string> FindMatchingNames(string query, IEnumerable<string> names)
    {
        var normalizedQuery = query.ToLowerInvariant();
        var queryTokens = GetQueryTokens(query);

        return names
            .Where(name =>
            {
                var normalizedName = name.ToLowerInvariant();
                if (normalizedQuery.Contains(normalizedName, StringComparison.Ordinal))
                {
                    return true;
                }

                return normalizedName.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Where(token => token.Length > 2)
                    .Any(queryTokens.Contains);
            })
            .ToList();
    }

    private static HashSet<string> GetQueryTokens(string query)
        => query.ToLowerInvariant()
            .Split([' ', ',', '.', ':', ';', '-', '_', '/', '(', ')'], StringSplitOptions.RemoveEmptyEntries)
            .Where(token => token.Length > 2)
            .ToHashSet(StringComparer.Ordinal);

    private static bool IsGenericEmployeeIntent(string normalizedRequest)
        => ContainsAny(normalizedRequest, "tell me about", "details", "detail", "information", "info", "what do you know", "show me more");

    private static bool ContainsAny(string text, params string[] values)
        => values.Any(text.Contains);

    public async ValueTask DisposeAsync()
    {
        await _leaveManagementProxy.DisposeAsync();
        await _payrollProxy.DisposeAsync();
    }
}
