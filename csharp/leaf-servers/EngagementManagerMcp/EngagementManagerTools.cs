using System.ComponentModel;
using ModelContextProtocol.Server;

[McpServerToolType]
public sealed class EngagementManagerTools(EngagementManagerService service)
{
    [McpServerTool, Description("List active and in-flight audit engagements")]
    public string list_active_engagements() => service.GetAllEngagementsText();

    [McpServerTool, Description("Return the current status for an engagement")]
    public string get_engagement_status([Description("Engagement name")] string engagementName)
        => service.GetEngagementStatusText(engagementName);

    [McpServerTool, Description("Return the staffed employees for an engagement")]
    public string get_engagement_staffing([Description("Engagement name")] string engagementName)
        => service.GetEngagementStaffingText(engagementName);

    [McpServerTool, Description("List engagements for a given region")]
    public string list_engagements_by_region([Description("Region such as US or LATAM")] string region)
        => service.GetEngagementsByRegionText(region);
}