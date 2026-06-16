# .NET MCP Orchestration POC

This folder contains the .NET implementation of the same MCP orchestration pattern used by the TypeScript POC at the repo root.

## Scope

- `apps/` contains the domain orchestrators.
- `leaf-servers/` contains the downstream MCP leaf servers.
- `shared/` contains common .NET MCP plumbing shared by the orchestrators.

## Run

Build the .NET solution first:

```powershell
dotnet build csharp/McpOrch.DotNet.slnx
```

Run either domain orchestrator:

```powershell
dotnet run --project csharp/apps/HrDomainOrchestratorMcp
dotnet run --project csharp/apps/CloudAuditSuiteOrchestratorMcp
```

Both orchestrators use `stdio` and launch their leaf servers as child processes, so a build is required before running.

## Claude Connector

For Claude Desktop, point the connector at the built domain orchestrator DLL and use `dotnet` as the command.

Example shape:

```json
{
	"mcpServers": {
		"hr-domain-orchestrator-mcp-dotnet": {
			"command": "dotnet",
			"args": [
				"C:/path/to/csharp/apps/HrDomainOrchestratorMcp/bin/Debug/net10.0/HrDomainOrchestratorMcp.dll"
			]
		},
        "cloud-audit-suite-orchestrator-mcp": {
			"command": "dotnet",
			"args": [
				"C:/path/to/csharp/apps/CloudAuditSuiteOrchestratorMcp/bin/Debug/net10.0/CloudAuditSuiteOrchestratorMcp.dll"
			]
		}
	}
}
```

The root README remains the main architecture overview for the overall project.