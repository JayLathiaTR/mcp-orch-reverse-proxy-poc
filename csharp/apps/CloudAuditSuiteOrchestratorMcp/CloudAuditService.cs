using McpOrch.Common.Infrastructure;
using McpOrch.Common.Models;

public sealed class CloudAuditService : IAsyncDisposable
{
    private static readonly LeafServerInfo[] LeafServers =
    [
        new(
            "engagement-manager-mcp",
            "Engagement portfolio, regional coverage, and status views",
            ["list_active_engagements", "get_engagement_status", "get_engagement_staffing", "list_engagements_by_region"]),
        new(
            "guided-assurance-mcp",
            "Control testing inventory, assurance summaries, and owner-based views",
            ["list_control_tests", "get_assurance_summary", "find_tests_by_owner"]),
    ];

    private readonly McpLeafProxyClient _engagementManagerProxy = new(
        "engagement-manager-mcp",
        RepoPaths.GetProjectPath("leaf-servers/EngagementManagerMcp/EngagementManagerMcp.csproj"));

    private readonly McpLeafProxyClient _guidedAssuranceProxy = new(
        "guided-assurance-mcp",
        RepoPaths.GetProjectPath("leaf-servers/GuidedAssuranceMcp/GuidedAssuranceMcp.csproj"));

    public Task<string> ListActiveEngagementsAsync(CancellationToken cancellationToken = default)
        => _engagementManagerProxy.CallTextToolAsync("list_active_engagements", cancellationToken: cancellationToken);

    public Task<string> GetEngagementStatusAsync(string engagementName, CancellationToken cancellationToken = default)
        => _engagementManagerProxy.CallTextToolAsync("get_engagement_status", new Dictionary<string, object?> { ["engagementName"] = engagementName }, cancellationToken);

    public Task<string> GetEngagementStaffingAsync(string engagementName, CancellationToken cancellationToken = default)
        => _engagementManagerProxy.CallTextToolAsync("get_engagement_staffing", new Dictionary<string, object?> { ["engagementName"] = engagementName }, cancellationToken);

    public Task<string> ListEngagementsByRegionAsync(string region, CancellationToken cancellationToken = default)
        => _engagementManagerProxy.CallTextToolAsync("list_engagements_by_region", new Dictionary<string, object?> { ["region"] = region }, cancellationToken);

    public Task<string> ListControlTestsAsync(CancellationToken cancellationToken = default)
        => _guidedAssuranceProxy.CallTextToolAsync("list_control_tests", cancellationToken: cancellationToken);

    public Task<string> GetAssuranceSummaryAsync(CancellationToken cancellationToken = default)
        => _guidedAssuranceProxy.CallTextToolAsync("get_assurance_summary", cancellationToken: cancellationToken);

    public Task<string> FindTestsByOwnerAsync(string ownerName, CancellationToken cancellationToken = default)
        => _guidedAssuranceProxy.CallTextToolAsync("find_tests_by_owner", new Dictionary<string, object?> { ["ownerName"] = ownerName }, cancellationToken);

    public string ListCloudAuditLeafServersText()
        => $"Cloud Audit Suite leaf MCP servers:\n{string.Join("\n", LeafServers.Select(server => $"- {server.Name}: {server.Purpose}"))}";

    public string ListCloudAuditToolsText()
        => $"Tools exposed by the Cloud Audit domain proxy:\n{string.Join("\n", LeafServers.Select(server => $"- {server.Name}: {string.Join(", ", server.Tools)}"))}";

    public async Task<string> HandleCloudAuditRequestAsync(string userRequest, CancellationToken cancellationToken = default)
    {
        var normalizedRequest = userRequest.ToLowerInvariant();
        var engagementMatches = await FindEngagementMatchesAsync(userRequest, cancellationToken);

        if (engagementMatches.Count > 1)
        {
            return $"I found multiple engagements in the Cloud Audit domain matching your request:\n- {string.Join("\n- ", engagementMatches)}\nWhich engagement do you want details for?";
        }

        var engagementName = engagementMatches.FirstOrDefault();

        if (ContainsAny(normalizedRequest, "worked on", "who worked", "staffed") && engagementName is not null)
        {
            return await GetEngagementStaffingAsync(engagementName, cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "engagement status", "status") && engagementName is not null)
        {
            return await GetEngagementStatusAsync(engagementName, cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "active engagement", "list engagements"))
        {
            return await ListActiveEngagementsAsync(cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "region", "regional"))
        {
            var region = new[] { "US", "LATAM", "EMEA", "APAC" }.FirstOrDefault(value => normalizedRequest.Contains(value.ToLowerInvariant(), StringComparison.Ordinal));
            if (region is not null)
            {
                return await ListEngagementsByRegionAsync(region, cancellationToken);
            }
        }

        if (engagementName is not null && ContainsAny(normalizedRequest, "tell me about", "details", "detail", "information", "info", "show me more"))
        {
            return $"I found {engagementName} in the Cloud Audit domain. Which detail do you want?\n- Engagement status and client details\n- Staffed employees\n- Regional context";
        }

        if (normalizedRequest.Contains("tests owned by ", StringComparison.Ordinal))
        {
            var ownerName = userRequest.Split("tests owned by ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).LastOrDefault();
            if (!string.IsNullOrWhiteSpace(ownerName))
            {
                return await FindTestsByOwnerAsync(ownerName, cancellationToken);
            }
        }

        if (normalizedRequest.Contains("list control tests", StringComparison.Ordinal))
        {
            return await ListControlTestsAsync(cancellationToken);
        }

        if (ContainsAny(normalizedRequest, "control", "assurance", "test"))
        {
            return await GetAssuranceSummaryAsync(cancellationToken);
        }

        return $"{ListCloudAuditToolsText()}\n- Cloud Audit domain note: The request did not map cleanly to one engagement or assurance tool.";
    }

    private async Task<IReadOnlyList<string>> FindEngagementMatchesAsync(string request, CancellationToken cancellationToken)
        => FindMatchingNames(request, ExtractEngagementNames(await ListActiveEngagementsAsync(cancellationToken)));

    private static List<string> ExtractEngagementNames(string text)
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

    private static bool ContainsAny(string text, params string[] values)
        => values.Any(text.Contains);

    public async ValueTask DisposeAsync()
    {
        await _engagementManagerProxy.DisposeAsync();
        await _guidedAssuranceProxy.DisposeAsync();
    }
}