import { NextResponse } from "next/server";

const REPAIR_TICKETS_DATABASE_ID = process.env.REPAIR_TICKETS_DATABASE_ID;

export async function GET() {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${REPAIR_TICKETS_DATABASE_ID}`,
    {
      method: "GET",
      cache: "no-cache",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "Notion-Version": "2022-06-28",
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      },
    },
  );

  const data = await res.json();
  return NextResponse.json(data);
}
