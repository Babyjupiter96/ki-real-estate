import { query } from "./db";
import { dashboardStats } from "./contacts";

export async function getAnalyticsSummary() {
  const stats = await dashboardStats();

  const eventsByType = await query<{ type: string; count: number }>(
    `SELECT type, COUNT(*)::int as count FROM page_events
     WHERE created_at >= now() - interval '30 days'
     GROUP BY type`
  );

  const dailyPageViews = await query<{ day: string; count: number }>(
    `SELECT to_char(created_at, 'YYYY-MM-DD') as day, COUNT(*)::int as count
     FROM page_events
     WHERE type = 'page_view' AND created_at >= now() - interval '14 days'
     GROUP BY day ORDER BY day ASC`
  );

  const topCtasRaw = await query<{ meta: string; count: number }>(
    `SELECT meta, COUNT(*)::int as count FROM page_events
     WHERE type = 'cta_click' AND created_at >= now() - interval '30 days'
     GROUP BY meta ORDER BY count DESC LIMIT 10`
  );

  const ctaBreakdown = topCtasRaw.map((row) => {
    let id = "unknown";
    try {
      id = JSON.parse(row.meta).id ?? "unknown";
    } catch {
      // ignore malformed meta
    }
    return { id, count: row.count };
  });

  return { ...stats, eventsByType, dailyPageViews, ctaBreakdown };
}

export type AnalyticsSummary = Awaited<ReturnType<typeof getAnalyticsSummary>>;
