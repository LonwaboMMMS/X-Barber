const ALLOWED_ORIGINS = new Set(["https://lonwabommms.github.io"]);

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://lonwabommms.github.io",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, service: "X Barbershop API" }, 200, origin);
    }

    if (url.pathname === "/api/availability" && request.method === "GET") {
      const date = url.searchParams.get("date") || "";
      const barberId = url.searchParams.get("barber_id") || "";
      if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date) || !["barber1", "barber2"].includes(barberId)) {
        return json({ error: "A valid date and barber_id are required." }, 400, origin);
      }

      try {
        const result = await env.DB.prepare(
          `SELECT appointment_time AS time
           FROM appointments
           WHERE appointment_date = ?1
             AND barber_id = ?2
             AND status IN ('pending', 'confirmed')
             AND (hold_expires_at IS NULL OR hold_expires_at > datetime('now'))`
        ).bind(date, barberId).all();

        return json({ date, barber_id: barberId, booked: (result.results || []).map(row => row.time) }, 200, origin);
      } catch (error) {
        return json({ error: "Availability could not be loaded." }, 500, origin);
      }
    }

    return json({ error: "Not found." }, 404, origin);
  }
};
