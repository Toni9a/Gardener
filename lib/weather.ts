const NORTHAMPTONSHIRE_LAT = 52.2405;
const NORTHAMPTONSHIRE_LON = -0.9027;
const RAINFALL_THRESHOLD_MM = 5; // >5mm in 48h = reduce watering reminders

export interface RainfallData {
  rainfall_mm: number;
  period_hours: number;
  needs_watering: boolean;
}

export async function getRainfallData(
  lat = NORTHAMPTONSHIRE_LAT,
  lon = NORTHAMPTONSHIRE_LON
): Promise<RainfallData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return { rainfall_mm: 0, period_hours: 48, needs_watering: true };
  }

  try {
    // Use One Call API 3.0 for hourly historical data
    const res = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&appid=${apiKey}&units=metric`,
      { next: { revalidate: 3600 } } // cache for 1 hour
    );

    if (!res.ok) throw new Error("Weather API error");

    const data = await res.json();
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - 48 * 3600;

    // Sum rainfall from last 48 hours in hourly data
    let totalRain = 0;
    for (const hour of data.hourly ?? []) {
      if (hour.dt >= cutoff && hour.rain?.["1h"]) {
        totalRain += hour.rain["1h"];
      }
    }

    return {
      rainfall_mm: Math.round(totalRain * 10) / 10,
      period_hours: 48,
      needs_watering: totalRain < RAINFALL_THRESHOLD_MM,
    };
  } catch {
    return { rainfall_mm: 0, period_hours: 48, needs_watering: true };
  }
}

export function getWateringMessage(rainfall: RainfallData): string {
  if (rainfall.rainfall_mm >= 10) {
    return `Good news — we've had ${rainfall.rainfall_mm}mm of rain recently, so your garden is well watered.`;
  }
  if (rainfall.rainfall_mm >= RAINFALL_THRESHOLD_MM) {
    return `There's been ${rainfall.rainfall_mm}mm of rain recently. Your garden may still benefit from a top-up.`;
  }
  return `It's been dry recently (${rainfall.rainfall_mm}mm in 48h). Your garden could use some water today.`;
}
