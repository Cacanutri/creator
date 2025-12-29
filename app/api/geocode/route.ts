export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return Response.json({ ok: false, error: "Missing query." });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&q=" +
      encodeURIComponent(query) +
      "&limit=1";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "CreatorVitrine/1.0",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json({ ok: false, error: "Geocode request failed." });
    }

    const data = (await response.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
    }>;

    if (!Array.isArray(data) || data.length === 0) {
      return Response.json({ ok: false, error: "No results." });
    }

    const first = data[0];
    const lat = first?.lat ? Number(first.lat) : NaN;
    const lng = first?.lon ? Number(first.lon) : NaN;

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return Response.json({ ok: false, error: "Invalid response." });
    }

    return Response.json({
      ok: true,
      lat,
      lng,
      display_name: first?.display_name ?? "",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return Response.json({ ok: false, error: message });
  } finally {
    clearTimeout(timeoutId);
  }
}
