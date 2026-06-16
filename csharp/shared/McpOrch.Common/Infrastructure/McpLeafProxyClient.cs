using ModelContextProtocol.Client;
using ModelContextProtocol.Protocol;

namespace McpOrch.Common.Infrastructure;

public sealed class McpLeafProxyClient : IAsyncDisposable
{
    private readonly string _leafServerName;
    private readonly string _projectPath;
    private readonly SemaphoreSlim _connectionGate = new(1, 1);
    private McpClient? _client;

    public McpLeafProxyClient(string leafServerName, string projectPath)
    {
        _leafServerName = leafServerName;
        _projectPath = projectPath;
    }

    public async Task<string> CallTextToolAsync(string toolName, IReadOnlyDictionary<string, object?>? args = null, CancellationToken cancellationToken = default)
    {
        var client = await GetClientAsync(cancellationToken);
        var result = await client.CallToolAsync(toolName, args?.ToDictionary(pair => pair.Key, pair => pair.Value), cancellationToken: cancellationToken);
        return McpTextContent.JoinText(result);
    }

    private async Task<McpClient> GetClientAsync(CancellationToken cancellationToken)
    {
        if (_client is not null)
        {
            return _client;
        }

        await _connectionGate.WaitAsync(cancellationToken);
        try
        {
            if (_client is null)
            {
                var transport = new StdioClientTransport(new StdioClientTransportOptions
                {
                    Name = _leafServerName,
                    Command = "dotnet",
                    Arguments = ["run", "--no-build", "--project", _projectPath],
                    WorkingDirectory = Path.GetDirectoryName(_projectPath),
                });

                _client = await McpClient.CreateAsync(transport, cancellationToken: cancellationToken);
            }

            return _client;
        }
        finally
        {
            _connectionGate.Release();
        }
    }

    public async ValueTask DisposeAsync()
    {
        _connectionGate.Dispose();

        if (_client is not null)
        {
            await _client.DisposeAsync();
        }
    }
}