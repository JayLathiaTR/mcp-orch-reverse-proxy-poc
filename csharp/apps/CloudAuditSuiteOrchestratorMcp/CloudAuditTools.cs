using System.ComponentModel;
using ModelContextProtocol.Server;

[McpServerToolType]
public sealed class CloudAuditTools(CloudAuditService service)
{
    [McpServerTool, Description("List the leaf MCP servers under the Cloud Audit domain connector")]
    public string list_cloud_audit_leaf_servers() => service.ListCloudAuditLeafServersText();

    [McpServerTool, Description("List the engagement and assurance tools exposed by the Cloud Audit domain proxy")]
    public string list_cloud_audit_tools() => service.ListCloudAuditToolsText();

    [McpServerTool, Description("Handle a natural-language Cloud Audit request by routing it to the engagement or guided assurance leaf MCP")]
    public Task<string> handle_cloud_audit_request([Description("Audit-related user request")] string userRequest, CancellationToken cancellationToken)
        => service.HandleCloudAuditRequestAsync(userRequest, cancellationToken);

    [McpServerTool, Description("Proxy list_active_engagements to the engagement-manager leaf MCP")]
    public Task<string> list_active_engagements(CancellationToken cancellationToken)
        => service.ListActiveEngagementsAsync(cancellationToken);

    [McpServerTool, Description("Proxy get_engagement_status to the engagement-manager leaf MCP")]
    public Task<string> get_engagement_status([Description("Engagement name")] string engagementName, CancellationToken cancellationToken)
        => service.GetEngagementStatusAsync(engagementName, cancellationToken);

    [McpServerTool, Description("Proxy get_engagement_staffing to the engagement-manager leaf MCP")]
    public Task<string> get_engagement_staffing([Description("Engagement name")] string engagementName, CancellationToken cancellationToken)
        => service.GetEngagementStaffingAsync(engagementName, cancellationToken);

    [McpServerTool, Description("Proxy list_engagements_by_region to the engagement-manager leaf MCP")]
    public Task<string> list_engagements_by_region([Description("Region such as US or LATAM")] string region, CancellationToken cancellationToken)
        => service.ListEngagementsByRegionAsync(region, cancellationToken);

    [McpServerTool, Description("Proxy list_control_tests to the guided-assurance leaf MCP")]
    public Task<string> list_control_tests(CancellationToken cancellationToken)
        => service.ListControlTestsAsync(cancellationToken);

    [McpServerTool, Description("Proxy get_assurance_summary to the guided-assurance leaf MCP")]
    public Task<string> get_assurance_summary(CancellationToken cancellationToken)
        => service.GetAssuranceSummaryAsync(cancellationToken);

    [McpServerTool, Description("Proxy find_tests_by_owner to the guided-assurance leaf MCP")]
    public Task<string> find_tests_by_owner([Description("Owner name")] string ownerName, CancellationToken cancellationToken)
        => service.FindTestsByOwnerAsync(ownerName, cancellationToken);
}