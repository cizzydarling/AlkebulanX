import { api } from "../api/client";

export const FALLBACK_COUNTRY_OPTIONS = [
  {
    name: "Ghana",
    currency: "GHS",
    cities: ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Tema"],
    networks: ["MTN", "Telecel", "AirtelTigo"],
    providers: ["flutterwave", "paystack"],
  },
  {
    name: "Nigeria",
    currency: "NGN",
    cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Enugu"],
    networks: [],
    providers: ["flutterwave", "paystack"],
  },
  {
    name: "Senegal",
    currency: "XOF",
    cities: ["Dakar", "Touba", "Thiès", "Kaolack", "Saint-Louis", "Ziguinchor"],
    networks: ["Orange Money", "Wave", "Free Money"],
    providers: ["flutterwave", "orange_money"],
  },
  {
    name: "Ivory Coast",
    currency: "XOF",
    cities: ["Abidjan", "Bouaké", "Yamoussoukro", "Daloa", "San-Pédro", "Korhogo"],
    networks: ["Orange Money", "MTN Money", "Moov Money", "Wave"],
    providers: ["flutterwave", "orange_money"],
  },
  {
    name: "Mali",
    currency: "XOF",
    cities: [
      "Bamako",
      "Sikasso",
      "Mopti",
      "Ségou",
      "Kayes",
      "Koutiala",
      "Gao",
      "Timbuktu",
      "Koulikoro",
      "Kati",
    ],
    networks: ["Orange Money", "Moov Money", "Wave"],
    providers: ["flutterwave", "orange_money"],
  },
];

export async function loadCountryOptions() {
  try {
    const res = await api.get("/countries");
    return res.data;
  } catch (err) {
    console.error("Failed to load countries. Using fallback.", err);
    return FALLBACK_COUNTRY_OPTIONS;
  }
}

export function getCountryConfig(countryName, countries = FALLBACK_COUNTRY_OPTIONS) {
  return countries.find((country) => country.name === countryName);
}

export function providerLabel(provider) {
  const labels = {
    flutterwave: "Flutterwave",
    paystack: "Paystack",
    orange_money: "Orange Money",
  };

  return labels[provider] || provider;
}