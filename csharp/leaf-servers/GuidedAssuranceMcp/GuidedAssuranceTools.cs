using System.ComponentModel;
using ModelContextProtocol.Server;

[McpServerToolType]
public sealed class GuidedAssuranceTools(GuidedAssuranceService service)
{
    [McpServerTool, Description("List the control tests in the guided assurance dataset")]
    public string list_control_tests() => service.GetAllControlTestsText();

    [McpServerTool, Description("Provide a high-level summary of control testing progress")]
    public string get_assurance_summary() => service.GetControlTestStatusSummaryText();

    [McpServerTool, Description("List control tests assigned to a specific owner")]
    public string find_tests_by_owner([Description("Owner name")] string ownerName)
        => service.GetTestsByOwnerText(ownerName);
}