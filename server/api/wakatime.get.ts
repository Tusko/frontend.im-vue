const SHARE = "https://wakatime.com/share/@tuskotrush";

interface Day {
  range: { date: string };
  grand_total: { text: string; total_seconds: number };
}
interface Lang {
  name: string;
  percent: number;
}

export default defineCachedEventHandler(
  async () => {
    const [activity, langs] = await Promise.all([
      $fetch<{ data: Day[] }>(`${SHARE}/8a6e81a1-5f7b-4ad6-a924-f3c620acdc6d.json`),
      $fetch<{ data: Lang[] }>(`${SHARE}/aa6a2ff7-94f5-434c-8aba-d06c33b5f472.json`),
    ]);

    return {
      activity: activity.data.map((d) => ({
        date: d.range.date.replace(/-/g, "."),
        text: d.grand_total.text,
        seconds: d.grand_total.total_seconds,
      })),
      langs: langs.data
        .filter((l) => l.percent > 0.5 && l.name.toLowerCase() !== "other")
        .map((l) => ({ name: l.name, percent: l.percent, color: langColor(l.name) })),
    };
  },
  { name: "wakatime", maxAge: 60 * 60 * 24, getKey: () => "v1" }
);
