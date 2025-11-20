import { NextResponse } from "next/server";

const ASK_TICKETS_DATABASE_ID = process.env.ASK_TICKETS_DATABASE_ID;
const ASSETS_DATABASE_ID = process.env.ASSETS_DATABASE_ID;
const REPAIR_TICKETS_DATABASE_ID = process.env.REPAIR_TICKETS_DATABASE_ID;

const notionHeaders = {
  accept: "application/json",
  "content-type": "application/json",
  "Notion-Version": "2022-06-28",
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
};

export async function GET() {
  try {
    const urls = [
      `https://api.notion.com/v1/databases/${ASK_TICKETS_DATABASE_ID}`,
      `https://api.notion.com/v1/databases/${ASSETS_DATABASE_ID}`,
      `https://api.notion.com/v1/databases/${REPAIR_TICKETS_DATABASE_ID}`,
    ];

    const responses = await Promise.all(
      urls.map((url) =>
        fetch(url, {
          method: "GET",
          cache: "no-cache",
          headers: notionHeaders,
        }),
      ),
    );

    const hasError = responses.some((r) => !r.ok);
    if (hasError) {
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
