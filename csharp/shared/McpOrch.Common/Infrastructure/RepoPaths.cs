using System.Reflection;

namespace McpOrch.Common.Infrastructure;

public static class RepoPaths
{
    private const string DotNetRootMarker = "McpOrch.DotNet.slnx";

    private static readonly Lazy<string> DotNetRoot = new(FindDotNetRoot);

    public static string GetProjectPath(string relativeProjectPath)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(relativeProjectPath);

        return Path.GetFullPath(Path.Combine(DotNetRoot.Value, relativeProjectPath));
    }

    private static string FindDotNetRoot()
    {
        var candidateRoots = new[]
        {
            AppContext.BaseDirectory,
            Directory.GetCurrentDirectory(),
            Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location),
        };

        foreach (var candidate in candidateRoots.Where(path => !string.IsNullOrWhiteSpace(path)))
        {
            var current = new DirectoryInfo(candidate!);
            while (current is not null)
            {
                if (File.Exists(Path.Combine(current.FullName, DotNetRootMarker)))
                {
                    return current.FullName;
                }

                current = current.Parent;
            }
        }

        throw new DirectoryNotFoundException($"Unable to find {DotNetRootMarker} from the current execution context.");
    }
}