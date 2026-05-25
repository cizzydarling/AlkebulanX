export function countryFlag(country) {
  const flags = {
    Canada: "🇨🇦",
    Ghana: "🇬🇭",
    Nigeria: "🇳🇬",
    Senegal: "🇸🇳",
    "Ivory Coast": "🇨🇮",
    Mali: "🇲🇱",
  };

  return flags[country] || "🌍";
}