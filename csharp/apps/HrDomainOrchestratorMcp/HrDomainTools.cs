using System.ComponentModel;
using ModelContextProtocol.Server;

[McpServerToolType]
public sealed class HrDomainTools(HrDomainService service)
{
    #region Domain level tools
    [McpServerTool, Description("List the two HR leaf MCP servers proxied by this domain connector")]
    public string list_hr_leaf_servers() => service.ListHrLeafServersText();

    [McpServerTool, Description("List the leave and payroll tools exposed by the HR domain proxy")]
    public string list_hr_tools() => service.ListHrToolsText();

    [McpServerTool, Description("Handle a natural-language HR request by routing it to the relevant leave-management or payroll leaf MCP")]
    public Task<string> handle_hr_request([Description("HR-related user request")] string userRequest, CancellationToken cancellationToken)
        => service.HandleHrRequestAsync(userRequest, cancellationToken: cancellationToken);
    #endregion

    #region Leaf-Server Proxy tools
    [McpServerTool, Description("Proxy list_all_employees to the leave-management leaf MCP")]
    public Task<string> list_all_employees(CancellationToken cancellationToken)
        => service.ListAllEmployeesAsync(cancellationToken);

    [McpServerTool, Description("Proxy list_all_managers to the leave-management leaf MCP")]
    public Task<string> list_all_managers(CancellationToken cancellationToken)
        => service.ListAllManagersAsync(cancellationToken);

    [McpServerTool, Description("Proxy check_leave_balance to the leave-management leaf MCP")]
    public Task<string> check_leave_balance([Description("Full name of the employee")] string employeeName, CancellationToken cancellationToken)
        => service.CheckLeaveBalanceAsync(employeeName, cancellationToken);

    [McpServerTool, Description("Proxy get_employee_manager to the leave-management leaf MCP")]
    public Task<string> get_employee_manager([Description("Full name of the employee")] string employeeName, CancellationToken cancellationToken)
        => service.GetEmployeeManagerAsync(employeeName, cancellationToken);

    [McpServerTool, Description("Proxy get_employee_profile to the leave-management leaf MCP")]
    public Task<string> get_employee_profile([Description("Full name of the employee")] string employeeName, CancellationToken cancellationToken)
        => service.GetEmployeeProfileAsync(employeeName, cancellationToken);

    [McpServerTool, Description("Proxy apply_leave to the leave-management leaf MCP")]
    public Task<string> apply_leave(
        [Description("Full name of the employee")] string employeeName,
        [Description("Type of leave")] string leaveType,
        [Description("Start date in YYYY-MM-DD format")] string startDate,
        [Description("End date in YYYY-MM-DD format")] string endDate,
        [Description("Reason for the leave")] string reason,
        CancellationToken cancellationToken)
        => service.ApplyLeaveAsync(employeeName, leaveType, startDate, endDate, reason, cancellationToken);

    [McpServerTool, Description("Proxy list_employee_leaves to the leave-management leaf MCP")]
    public Task<string> list_employee_leaves([Description("Full name of the employee")] string employeeName, CancellationToken cancellationToken)
        => service.ListEmployeeLeavesAsync(employeeName, cancellationToken);

    [McpServerTool, Description("Proxy list_pending_approvals to the leave-management leaf MCP")]
    public Task<string> list_pending_approvals([Description("Full name of the manager")] string managerName, CancellationToken cancellationToken)
        => service.ListPendingApprovalsAsync(managerName, cancellationToken);

    [McpServerTool, Description("Proxy approve_leave to the leave-management leaf MCP")]
    public Task<string> approve_leave(
        [Description("The leave request ID to approve")] string leaveRequestId,
        [Description("Full name of the approving manager")] string managerName,
        CancellationToken cancellationToken)
        => service.ApproveLeaveAsync(leaveRequestId, managerName, cancellationToken);

    [McpServerTool, Description("Proxy partial_approve_leave to the leave-management leaf MCP")]
    public Task<string> partial_approve_leave(
        [Description("The leave request ID to partially approve")] string leaveRequestId,
        [Description("Full name of the approving manager")] string managerName,
        [Description("How many days to approve")] int approvedDays,
        [Description("Reason the remaining requested days are rejected")] string rejectionReason,
        CancellationToken cancellationToken)
        => service.PartialApproveLeaveAsync(leaveRequestId, managerName, approvedDays, rejectionReason, cancellationToken);

    [McpServerTool, Description("Proxy reject_leave to the leave-management leaf MCP")]
    public Task<string> reject_leave(
        [Description("The leave request ID to reject")] string leaveRequestId,
        [Description("Full name of the rejecting manager")] string managerName,
        [Description("Reason for rejection")] string reason,
        CancellationToken cancellationToken)
        => service.RejectLeaveAsync(leaveRequestId, managerName, reason, cancellationToken);

    [McpServerTool, Description("Proxy get_payroll_summary to the payroll leaf MCP")]
    public Task<string> get_payroll_summary([Description("Full name of the employee")] string employeeName, CancellationToken cancellationToken)
        => service.GetPayrollSummaryAsync(employeeName, cancellationToken);

    [McpServerTool, Description("Proxy get_last_pay_date to the payroll leaf MCP")]
    public Task<string> get_last_pay_date([Description("Full name of the employee")] string employeeName, CancellationToken cancellationToken)
        => service.GetLastPayDateAsync(employeeName, cancellationToken);

    [McpServerTool, Description("Proxy list_pay_components to the payroll leaf MCP")]
    public Task<string> list_pay_components([Description("Full name of the employee")] string employeeName, CancellationToken cancellationToken)
        => service.ListPayComponentsAsync(employeeName, cancellationToken);
    #endregion
}