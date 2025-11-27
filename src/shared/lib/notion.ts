const NOTION_API_VERSION = "2025-09-03";
const NOTION_BASE_URL = "https://api.notion.com/v1";

export class NotionApiError extends Error {
  constructor(
    public readonly data: unknown,
    public readonly status: number,
  ) {
    super("Notion API Error");
    this.name = "NotionApiError";
  }
}

export async function notionRequest<T>(
  endpoint: string,
  options?: {
    method?: string;
    body?: Record<string, any>;
  },
): Promise<T> {
  const fetchOptions: RequestInit = {
    method: options?.method || "GET",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_API_VERSION,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${NOTION_BASE_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json();
    throw new NotionApiError(errorData, response.status);
  }

  return response.json();
}
