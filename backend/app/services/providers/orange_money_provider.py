from typing import Dict, Optional

from app.services.providers.base_provider import BaseProvider


class OrangeMoneyProvider(BaseProvider):
    provider_key = "orange_money"
    display_name = "Orange Money"

    supported_countries = {
    "senegal",
    "cote d'ivoire",
    "ivory coast",
    "mali",
    }

    supported_payout_methods = {"mobile_money"}

    mock_rates = {
        "XOF": 428.00,
    }

    def supports_country(self, country: str) -> bool:
        return country.strip().lower() in self.supported_countries

    def supports_payout_method(self, payout_method: str) -> bool:
        return payout_method in self.supported_payout_methods

    def quote(
        self,
        send_amount: float,
        source_currency: str,
        destination_currency: str,
        payout_method: str,
    ) -> Dict:
        rate = self.mock_rates.get(destination_currency.upper(), 1.0)
        fee = round(max(3.99, send_amount * 0.032), 2)

        return {
            "provider": self.provider_key,
            "provider_display_name": self.display_name,
            "source_currency": source_currency.upper(),
            "destination_currency": destination_currency.upper(),
            "send_amount": send_amount,
            "exchange_rate": rate,
            "fee_amount": fee,
            "estimated_receive_amount": round(send_amount * rate, 2),
            "total_cost": round(send_amount + fee, 2),
            "estimated_delivery_time": "Instant to 2 hours",
            "payout_method": payout_method,
            "available": True,
            "message": "Mock Orange Money quote. Replace with live API before production.",
        }

    def create_checkout_session(
        self,
        transfer_id: int,
        amount: float,
        currency: str,
        customer_email: str,
        metadata: Optional[Dict] = None,
    ) -> Dict:
        return {
            "provider": self.provider_key,
            "transfer_id": transfer_id,
            "checkout_url": f"https://mock.orange-money.com/pay/alkebulanx-{transfer_id}",
            "reference": f"OMG-MOCK-{transfer_id}",
            "status": "mock_created",
            "metadata": metadata or {},
        }