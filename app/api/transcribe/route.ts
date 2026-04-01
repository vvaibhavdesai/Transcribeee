import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  try {
    const cohereForm = new FormData();
    cohereForm.append("model", formData.get("model") as string);
    cohereForm.append("language", formData.get("language") as string);
    cohereForm.append("temperature", formData.get("temperature") as string);
    cohereForm.append("file", formData.get("file") as Blob);

    const res = await fetch(
      "https://api.cohere.com/v2/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: cohereForm,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}