COUNTRY_OPTIONS = [
    {
        "name": "Ghana",
        "currency": "GHS",
        "cities": ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Tema"],
        "networks": ["MTN", "Telecel", "AirtelTigo"],
        "providers": ["flutterwave", "paystack"],
    },
    {
        "name": "Nigeria",
        "currency": "NGN",
        "cities": ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Enugu"],
        "networks": [],
        "providers": ["flutterwave", "paystack"],
    },
    {
        "name": "Senegal",
        "currency": "XOF",
        "cities": ["Dakar", "Touba", "Thiès", "Kaolack", "Saint-Louis", "Ziguinchor"],
        "networks": ["Orange Money", "Wave", "Free Money"],
        "providers": ["flutterwave", "orange_money"],
    },
    {
        "name": "Ivory Coast",
        "currency": "XOF",
        "cities": ["Abidjan", "Bouaké", "Yamoussoukro", "Daloa", "San-Pédro", "Korhogo"],
        "networks": ["Orange Money", "MTN Money", "Moov Money", "Wave"],
        "providers": ["flutterwave", "orange_money"],
    },
    {
        "name": "Mali",
        "currency": "XOF",
        "cities": [
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
        "networks": ["Orange Money", "Moov Money", "Wave"],
        "providers": ["flutterwave", "orange_money"],
    },
]


def normalize_country(country: str) -> str:
    return country.strip().lower()


def get_country_by_name(country_name: str):
    normalized = normalize_country(country_name)

    for country in COUNTRY_OPTIONS:
        if normalize_country(country["name"]) == normalized:
            return country

    return None