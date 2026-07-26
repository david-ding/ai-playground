import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod/v4";

const server = new McpServer(
  { name: "api-tool", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.registerTool(
  "get_json",
  {
    description:
      "Make a GET request to a JSON API and return the parsed response body.",
    inputSchema: z.object({
      url: z.string().describe('The full API URL to call'),
      headers: z
        .record(z.string(), z.string())
        .optional()
        .describe('Optional request headers as key-value pairs'),
    }),
  },
  async ({ url, headers }) => {
    const response = await fetch(url, {
      method: "GET",
      headers: { ...headers, "User-Agent": "api-tool-mcp/1.0" },
    });
    if (!response.ok) {
      throw new Error(
        `API responded with status ${response.status}: ${response.statusText}`,
      );
    }
    const data = await response.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
