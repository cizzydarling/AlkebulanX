from typing import Dict, Optional

import httpx

from app.core.config import settings
from app.services.providers.base_provider import BaseProvider


class FlutterwaveProvider(BaseProvider):
    provider_key = "flutterwave"
    display_name = "Flutterwave"

    supported_countries = {
        "ghana",
        "nigeria",
        "senegal",
        "cote d'ivoire",
        "ivory coast",
        "mali",
    }

    supported_payout_methods = {"mobile_money", "bank_account"}

    mock_rates = {
        "GHS": 8.65,
        "NGN": 1120.00,
        "XOF": 430.00,
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
        fee = round(max(3.49, send_amount * 0.029), 2)

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
            "estimated_delivery_time": "Instant to 1 hour",
            "payout_method": payout_method,
            "available": True,
            "message": "Flutterwave quote. MVP rate is mocked until live FX pricing is connected.",
        }

    def create_checkout_session(
        self,
        transfer_id: int,
        amount: float,
        currency: str,
        customer_email: str,
        metadata: Optional[Dict] = None,
    ) -> Dict:
        if not settings.USE_LIVE_FLUTTERWAVE:
            return {
                "provider": self.provider_key,
                "transfer_id": transfer_id,
                "checkout_url": f"https://mock.flutterwave.com/pay/alkebulanx-{transfer_id}",
                "reference": f"FLW-MOCK-{transfer_id}",
                "status": "mock_created",
                "metadata": metadata or {},
            }

        if not settings.FLUTTERWAVE_SECRET_KEY:
            raise ValueError("FLUTTERWAVE_SECRET_KEY is missing.")

        tx_ref = f"ALKX-{transfer_id}"

        payload = {
            "tx_ref": tx_ref,
            "amount": str(round(amount, 2)),
            "currency": currency.upper(),
            "redirect_url": f"{settings.FRONTEND_BASE_URL}/payment-result",
            "customer": {"email": customer_email},
            "customizations": {
                "title": "AlkebulanX",
                "description": f"AlkebulanX transfer #{transfer_id}",
            },
            "meta": metadata or {},
        }

        headers = {
            "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        response = httpx.post(
            "https://api.flutterwave.com/v3/payments",
            json=payload,
            headers=headers,
            timeout=30,
        )
        response.raise_for_status()

        data = response.json()
        checkout_url = data.get("data", {}).get("link")

        if not checkout_url:
            raise ValueError("Flutterwave did not return a checkout link.")

        return {
            "provider": self.provider_key,
            "transfer_id": transfer_id,
            "checkout_url": checkout_url,
            "reference": tx_ref,
            "status": data.get("status", "created"),
            "metadata": metadata or {},
        }

    def verify_transaction(
        self,
        provider_reference: str,
        expected_amount: float,
        expected_currency: str,
        transaction_id: Optional[str] = None,
    ) -> Dict:
        if not settings.USE_LIVE_FLUTTERWAVE:
            return {
                "verified": True,
                "status": "successful",
                "tx_ref": provider_reference,
                "amount": round(expected_amount, 2),
                "currency": expected_currency.upper(),
                "message": "Mock Flutterwave verification passed.",
                "raw": {},
            }

        if not settings.FLUTTERWAVE_SECRET_KEY:
            raise ValueError("FLUTTERWAVE_SECRET_KEY is missing.")

        headers = {
            "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        if transaction_id:
            url = f"https://api.flutterwave.com/v3/transactions/{transaction_id}/verify"
            response = httpx.get(url, headers=headers, timeout=30)
        else:
            response = httpx.get(
                "https://api.flutterwave.com/v3/transactions/verify_by_reference",
                params={"tx_ref": provider_reference},
                headers=headers,
                timeout=30,
            )

        response.raise_for_status()
        payload = response.json()
        data = payload.get("data") or {}

        actual_status = str(data.get("status", "")).lower()
        actual_tx_ref = str(data.get("tx_ref", ""))
        actual_currency = str(data.get("currency", "")).upper()

        try:
            actual_amount = float(data.get("amount", 0))
        except (TypeError, ValueError):
            actual_amount = 0.0

        expected_amount_rounded = round(float(expected_amount), 2)
        actual_amount_rounded = round(actual_amount, 2)

        verified = (
            actual_status in {"successful", "success", "completed"}
            and actual_tx_ref == provider_reference
            and actual_currency == expected_currency.upper()
            and actual_amount_rounded == expected_amount_rounded
        )

        return {
            "verified": verified,
            "status": actual_status,
            "tx_ref": actual_tx_ref,
            "amount": actual_amount_rounded,
            "currency": actual_currency,
            "message": "Flutterwave verification completed.",
            "raw": payload,
        }