import process from "process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import type { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js";

type LeafProxyConfig = {
  name: string;
  cwd: string;
  command?: string;
  args?: string[];
};

export class McpLeafProxyClient {
  private readonly config: Required<LeafProxyConfig>;
  private readonly client = new Client({
    name: "cloud-audit-suite-orchestrator-mcp",
    version: "1.0.0",
  }, {
    capabilities: {},
  });
  private connectPromise?: Promise<void>;

  constructor(config: LeafProxyConfig) {
    this.config = {
      command: process.execPath,
      args: ["dist/index.js"],
      ...config,
    };
  }

  private async ensureConnected() {
    if (!this.connectPromise) {
      const transport = new StdioClientTransport({
        command: this.config.command,
        args: this.config.args,
        cwd: this.config.cwd,
        stderr: "pipe",
      });

      transport.stderr?.on("data", () => {
        // Ignore leaf stderr unless deeper proxy diagnostics are needed.
      });

      this.connectPromise = this.client.connect(transport);
    }

    await this.connectPromise;
  }

  async callTextTool(name: string, args: Record<string, unknown> = {}) {
    await this.ensureConnected();

    const result = await this.client.callTool({ name, arguments: args }, CallToolResultSchema) as CallToolResult;
    const textParts = result.content
      .flatMap(content => content.type === "text" ? [(content as TextContent).text] : []);

    if (textParts.length === 0) {
      throw new Error(`Leaf MCP ${this.config.name} returned no text content for tool ${name}.`);
    }

    return textParts.join("\n");
  }
}