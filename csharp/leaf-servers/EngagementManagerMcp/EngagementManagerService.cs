public sealed class EngagementManagerService
{
    private readonly List<EngagementRecord> _engagements =
    [
        new("ENG001", "SOX Controls FY26", "Northwind Retail", "Active", "Maya Collins", "US", ["Aarav Sharma", "Priya Nair"]),
        new("ENG002", "Cloud Security Review", "Fabrikam Energy", "Planning", "Daniel Ortiz", "LATAM", ["Sofia Martinez", "Diego Ramirez"]),
        new("ENG003", "ITGC Audit", "Contoso Manufacturing", "Active", "Lucia Moreno", "LATAM", ["Valeria Gomez", "Mateo Herrera"]),
    ];

    public string GetAllEngagementsText()
    {
        var activeEngagements = _engagements.Where(engagement => !engagement.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase));
        var summary = activeEngagements
            .Select(engagement => $"- {engagement.Name} ({engagement.Id}) | Client: {engagement.ClientName} | Status: {engagement.Status} | Manager: {engagement.EngagementManager}")
            .ToArray();

        return $"Active engagement portfolio:\n{string.Join("\n", summary)}";
    }

    public string GetEngagementStatusText(string engagementName)
    {
        var engagement = FindEngagement(engagementName);
        if (engagement is null)
        {
            return $"No engagement found with the name {engagementName}.";
        }

        return $"Engagement status for {engagement.Name}:\n- Engagement ID: {engagement.Id}\n- Client: {engagement.ClientName}\n- Status: {engagement.Status}\n- Engagement manager: {engagement.EngagementManager}\n- Region: {engagement.Region}";
    }

    public string GetEngagementStaffingText(string engagementName)
    {
        var engagement = FindEngagement(engagementName);
        if (engagement is null)
        {
            return $"No engagement found with the name {engagementName}.";
        }

        return $"Engagement staffing for {engagement.Name}:\n- Staffed employees: {string.Join(", ", engagement.StaffedEmployees)}";
    }

    public string GetEngagementsByRegionText(string region)
    {
        var matches = _engagements.Where(item => item.Region.Equals(region, StringComparison.OrdinalIgnoreCase)).ToArray();
        if (matches.Length == 0)
        {
            return $"No engagements found for region {region}.";
        }

        var summary = matches.Select(item => $"- {item.Name} | Client: {item.ClientName} | Status: {item.Status}");
        return $"Engagements in {region}:\n{string.Join("\n", summary)}";
    }

    public IReadOnlyList<string> FindMatchingEngagementNames(string query)
    {
        var normalizedQuery = query.ToLowerInvariant();
        var queryTokens = GetQueryTokens(query);

        return _engagements
            .Where(engagement =>
            {
                var name = engagement.Name.ToLowerInvariant();
                if (normalizedQuery.Contains(name, StringComparison.Ordinal))
                {
                    return true;
                }

                return name.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Where(token => token.Length > 2)
                    .Any(queryTokens.Contains);
            })
            .Select(engagement => engagement.Name)
            .ToArray();
    }

    private EngagementRecord? FindEngagement(string engagementName)
        => _engagements.FirstOrDefault(item => item.Name.Equals(engagementName, StringComparison.OrdinalIgnoreCase));

    private static HashSet<string> GetQueryTokens(string query)
        => query.ToLowerInvariant()
            .Split([' ', ',', '.', ':', ';', '-', '_', '/', '(', ')'], StringSplitOptions.RemoveEmptyEntries)
            .Where(token => token.Length > 2)
            .ToHashSet(StringComparer.Ordinal);
}

public sealed record EngagementRecord(
    string Id,
    string Name,
    string ClientName,
    string Status,
    string EngagementManager,
    string Region,
    string[] StaffedEmployees);