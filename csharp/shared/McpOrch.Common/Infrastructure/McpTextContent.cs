using ModelContextProtocol.Protocol;

namespace McpOrch.Common.Infrastructure;

public static class McpTextContent
{
    public static string JoinText(CallToolResult result)
    {
        var textParts = result.Content
            .OfType<TextContentBlock>()
            .Select(content => content.Text)
            .Where(text => !string.IsNullOrWhiteSpace(text))
            .ToArray();

        if (textParts.Length == 0)
        {
            throw new InvalidOperationException("The MCP tool result did not contain any text content.");
        }

        return string.Join("\n", textParts);
    }
}