export function normalizeLinkedinUrl(url) {
  if (!url) return "";
  let cleaned = url.trim().toLowerCase();
  cleaned = cleaned.replace(/\?.*$/, "");
  cleaned = cleaned.replace(/#.*$/, "");
  cleaned = cleaned.replace(/\/$/, "");
  return cleaned;
}

export function buildQueriesFromSpec(spec) {
  const titles = (spec.job_titles || []).map((t) => `"${t}"`);
  const companies = (spec.companies || []).map((c) => `"${c}"`);
  const keywords = (spec.keywords || []).map((k) => `"${k}"`);
  const exclusions = (spec.exclusions || []).map((e) => `"${e}"`);

  const parts = [
    "site:linkedin.com/in",
    titles.length ? `(${titles.join(" OR ")})` : null,
    companies.length ? `(${companies.join(" OR ")})` : null,
    keywords.length ? `(${keywords.join(" OR ")})` : null,
    exclusions.length ? `-(${exclusions.join(" OR ")})` : null,
    spec.location ? `"${spec.location}"` : null,
  ].filter(Boolean);

  const main = parts.join(" ");

  return [
    { query_type: "xray_linkedin", label: "Primary", query_text: main },
    {
      query_type: "xray_linkedin_variant",
      label: "Title variation",
      query_text: main.replace(/\"/g, "\"").replace(/\s+/g, " "),
    },
  ];
}

export function defaultSpecFromPrompt(prompt) {
  const trimmed = (prompt || "").trim();
  if (!trimmed) {
    return {
      companies: [],
      job_titles: [],
      locations: [],
      location: "",
      keywords: [],
      exclusions: [],
      ranking_criteria: [],
    };
  }

  const text = trimmed.toLowerCase();
  const location = text.includes("manchester")
    ? "Manchester"
    : text.includes("london")
    ? "London"
    : "United Kingdom";

  return {
    companies: ["SG Fleet UK", "Holman", "Lex Autolease"],
    job_titles: [
      "Business Development Manager",
      "Corporate Sales Manager",
      "Sales Director",
    ],
    locations: [location],
    location,
    keywords: ["leasing", "fleet", "contract hire"],
    exclusions: ["internal sales", "telesales"],
    ranking_criteria: ["Leasing", "Products"],
  };
}

export function toCsv(rows) {
  const header = [
    "full_name",
    "current_company",
    "current_title",
    "location",
    "linkedin_url",
    "score",
    "status",
  ];
  const lines = [header.join(",")];

  rows.forEach((row) => {
    const values = header.map((key) => {
      const raw = row[key] ?? "";
      const safe = String(raw).replace(/"/g, '""');
      return `"${safe}"`;
    });
    lines.push(values.join(","));
  });

  return lines.join("\n");
}
