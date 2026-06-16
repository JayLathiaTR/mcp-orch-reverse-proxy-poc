using System.ComponentModel;
using ModelContextProtocol.Server;

[McpServerToolType]
public sealed class LeaveManagementTools(LeaveManagementService service)
{
    [McpServerTool, Description("Check if the leave server is running")]
    public string ping() => "Leave Management MCP server is alive!";

    [McpServerTool, Description("List all employees available in the leave management system")]
    public string list_all_employees() => service.ListAllEmployeesText();

    [McpServerTool, Description("List all managers available in the leave management system")]
    public string list_all_managers() => service.ListAllManagersText();

    [McpServerTool, Description("Check remaining leave days for an employee")]
    public string check_leave_balance([Description("Full name of the employee")] string employeeName)
        => service.CheckLeaveBalanceText(employeeName);

    [McpServerTool, Description("Get the directly assigned manager for an employee")]
    public string get_employee_manager([Description("Full name of the employee")] string employeeName)
        => service.GetEmployeeManagerText(employeeName);

    [McpServerTool, Description("Get the employee profile including manager details")]
    public string get_employee_profile([Description("Full name of the employee")] string employeeName)
        => service.GetEmployeeProfileText(employeeName);

    [McpServerTool, Description("Submit a leave request for an employee")]
    public string apply_leave(
        [Description("Full name of the employee")] string employeeName,
        [Description("Type of leave: Annual, Sick, or Unpaid")] string leaveType,
        [Description("Start date in YYYY-MM-DD format")] string startDate,
        [Description("End date in YYYY-MM-DD format")] string endDate,
        [Description("Reason for the leave")] string reason)
        => service.ApplyLeaveText(employeeName, leaveType, startDate, endDate, reason);

    [McpServerTool, Description("List all leave requests for an employee")]
    public string list_employee_leaves([Description("Full name of the employee")] string employeeName)
        => service.ListEmployeeLeavesText(employeeName);

    [McpServerTool, Description("List all pending leave requests for a manager's team")]
    public string list_pending_approvals([Description("Full name of the manager")] string managerName)
        => service.ListPendingApprovalsText(managerName);

    [McpServerTool, Description("Approve a pending leave request")]
    public string approve_leave(
        [Description("The leave request ID to approve")] string leaveRequestId,
        [Description("Full name of the approving manager")] string managerName)
        => service.ApproveLeaveText(leaveRequestId, managerName);

    [McpServerTool, Description("Approve part of a pending leave request and reject the remainder")]
    public string partial_approve_leave(
        [Description("The leave request ID to partially approve")] string leaveRequestId,
        [Description("Full name of the approving manager")] string managerName,
        [Description("How many days to approve from the original leave request")] int approvedDays,
        [Description("Reason the remaining requested days are being rejected")] string rejectionReason)
        => service.PartialApproveLeaveText(leaveRequestId, managerName, approvedDays, rejectionReason);

    [McpServerTool, Description("Reject a pending leave request")]
    public string reject_leave(
        [Description("The leave request ID to reject")] string leaveRequestId,
        [Description("Full name of the rejecting manager")] string managerName,
        [Description("Reason for rejection")] string reason)
        => service.RejectLeaveText(leaveRequestId, managerName, reason);
}