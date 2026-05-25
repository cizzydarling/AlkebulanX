from typing import Dict, Optional

from app.services.providers.base_provider import BaseProvider


class PaystackProvider(BaseProvider):
    provider_key = "paystack"
    display_name = "Paystack"

    supported_countries = {
        "ghana",
        "nigeria",
    }

    supported_payout_methods = {"mobile_money", "bank_account"}

    mock_rates = {
        "GHS": 8.7,
        "NGN": 1115.00,
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
        fee = round(max(2.99, send_amount * 0.025), 2)

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
            "estimated_delivery_time": "Instant to 30 minutes",
            "payout_method": payout_method,
            "available": True,
            "message": "Mock Paystack quote. Replace with live API before production.",
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
            "checkout_url": f"https://mock.paystack.com/pay/alkebulanx-{transfer_id}",
            "reference": f"PAY-MOCK-{transfer_id}",
            "status": "mock_created",
            "metadata": metadata or {},
        }