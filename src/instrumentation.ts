export async function register() {
  // Only run in the actual Node.js server process (not the Edge runtime,
  // and not during `next build`'s page-data collection pass).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const cron = await import("node-cron");
  const { runFollowUpScan } = await import("./lib/scheduler");

  // Every hour, check for contacts whose follow-up date has passed and
  // email a reminder. See src/lib/scheduler.ts for the actual query.
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await runFollowUpScan();
      if (result.checked > 0) {
        console.log(
          `[scheduler] follow-up scan: ${result.sent}/${result.checked} reminder(s) sent`
        );
      }
    } catch (err) {
      console.error("[scheduler] follow-up scan failed", err);
    }
  });

  console.log("[scheduler] follow-up reminder cron registered (hourly)");
}
