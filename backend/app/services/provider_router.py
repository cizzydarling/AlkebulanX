from typing import Dict, List, Optional

from app.models.recipient_model import Recipient
from app.schemas.transfer_schema import ProviderQuote
from app.services.providers.base_provider import BaseProvider
from app.services.providers.flutterwave_provider import FlutterwaveProvider
from app.services.providers.orange_money_provider import OrangeMoneyProvider
from app.services.providers.paystack_provider import PaystackProvider


SUPPORTED_COUNTRIES = {
    "ghana": {"currency": "GHS"},
    "nigeria": {"currency": "NGN"},
    "senegal": {"currency": "XOF"},
    "cote d'ivoire": {"currency": "XOF"},
    "ivory coast": {"currency": "XOF"},
    "mali": {"currency": "XOF"},
}


PROVIDERS: Dict[str, BaseProvider] = {
    "flutterwave": FlutterwaveProvider(),
    "paystack": PaystackProvider(),
    "orange_money": OrangeMoneyProvider(),
}


def normalize_country(country: str) -> str:
    return country.strip().lower()


def get_destination_currency(recipient: Recipient, fallback: str) -> str:
    country_key = normalize_country(recipient.country)
    country_config = SUPPORTED_COUNTRIES.get(country_key)

    if country_config:
        return country_config["currency"]

    return fallback.upper()


def get_provider(provider_key: str) -> Optional[BaseProvider]:
    return PROVIDERS.get(provider_key)


def get_available_providers(recipient: Recipient) -> List[BaseProvider]:
    providers = [
        provider
        for provider in PROVIDERS.values()
        if provider.supports_country(recipient.country)
        and provider.supports_payout_method(recipient.payout_method)
    ]

    if recipient.provider_preference:
        preferred = [
            provider
            for provider in providers
            if provider.provider_key == recipient.provider_preference
        ]

        others = [
            provider
            for provider in providers
            if provider.provider_key != recipient.provider_preference
        ]

        return preferred + others

    return providers


def get_provider_quotes(
    recipient: Recipient,
    send_amount: float,
    source_currency: str,
    destination_currency: str,
) -> List[ProviderQuote]:
    providers = get_available_providers(recipient)

    quotes: List[ProviderQuote] = []

    for provider in providers:
        quote_data = provider.quote(
            send_amount=send_amount,
            source_currency=source_currency,
            destination_currency=destination_currency,
            payout_method=recipient.payout_method,
        )

        quotes.append(ProviderQuote(**quote_data))

    return sorted(quotes, key=lambda quote: quote.total_cost)