using System.ComponentModel;
using ModelContextProtocol.Server;

[McpServerToolType]
public sealed class PayrollTools(PayrollService service)
{
    [McpServerTool, Description("Get a monthly payroll summary for an employee")]
    public string get_payroll_summary([Description("Full name of the employee")] string employeeName)
        => service.GetPayrollSummaryText(employeeName);

    [McpServerTool, Description("Get a monthly payroll summary for an employee using a clearer tool name")]
    public string get_employee_payroll_summary([Description("Full name of the employee")] string employeeName)
        => service.GetPayrollSummaryText(employeeName);

    [McpServerTool, Description("Return the most recent payroll date for an employee")]
    public string get_last_pay_date([Description("Full name of the employee")] string employeeName)
        => service.GetLastPayDateText(employeeName);

    [McpServerTool, Description("Return the most recent payroll date for an employee using a clearer tool name")]
    public string get_employee_last_pay_date([Description("Full name of the employee")] string employeeName)
        => service.GetLastPayDateText(employeeName);

    [McpServerTool, Description("List the payroll components used for an employee")]
    public string list_pay_components([Description("Full name of the employee")] string employeeName)
        => service.GetPayComponentsText(employeeName);

    [McpServerTool, Description("List the payroll components used for an employee using a clearer tool name")]
    public string list_employee_pay_components([Description("Full name of the employee")] string employeeName)
        => service.GetPayComponentsText(employeeName);
}