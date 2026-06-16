public sealed class GuidedAssuranceService
{
    private readonly List<ControlTestRecord> _controlTests =
    [
        new("CTL001", "User Access Reviews", "In Progress", "Alicia Park"),
        new("CTL002", "Change Management", "Passed", "Rafael Soto"),
        new("CTL003", "Backup and Recovery", "Not Started", "Alicia Park"),
    ];

    public string GetAllControlTestsText()
    {
        var summary = _controlTests
            .Select(test => $"- {test.ControlArea} ({test.Id}) | Status: {test.TestStatus} | Owner: {test.Owner}");

        return $"Guided assurance control tests:\n{string.Join("\n", summary)}";
    }

    public string GetControlTestStatusSummaryText()
    {
        var counts = _controlTests
            .GroupBy(test => test.TestStatus)
            .ToDictionary(group => group.Key, group => group.Count(), StringComparer.OrdinalIgnoreCase);

        return $"Guided assurance summary:\n- Not Started: {counts.GetValueOrDefault("Not Started", 0)}\n- In Progress: {counts.GetValueOrDefault("In Progress", 0)}\n- Passed: {counts.GetValueOrDefault("Passed", 0)}\n- Failed: {counts.GetValueOrDefault("Failed", 0)}";
    }

    public string GetTestsByOwnerText(string ownerName)
    {
        var matches = _controlTests.Where(test => test.Owner.Equals(ownerName, StringComparison.OrdinalIgnoreCase)).ToArray();
        if (matches.Length == 0)
        {
            return $"No control tests found for owner {ownerName}.";
        }

        var summary = matches.Select(test => $"- {test.ControlArea} ({test.Id}) | Status: {test.TestStatus}");
        return $"Control tests owned by {ownerName}:\n{string.Join("\n", summary)}";
    }
}

public sealed record ControlTestRecord(string Id, string ControlArea, string TestStatus, string Owner);