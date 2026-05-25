from abc import ABC, abstractmethod
from typing import Dict, Optional


class BaseProvider(ABC):
    provider_key: str
    display_name: str

    @abstractmethod
    def supports_country(self, country: str) -> bool:
        pass

    @abstractmethod
    def supports_payout_method(self, payout_method: str) -> bool:
        pass

    @abstractmethod
    def quote(
        self,
        send_amount: float,
        source_currency: str,
        destination_currency: str,
        payout_method: str,
    ) -> Dict:
        pass

    @abstractmethod
    def create_checkout_session(
        self,
        transfer_id: int,
        amount: float,
        currency: str,
        customer_email: str,
        metadata: Optional[Dict] = None,
    ) -> Dict:
        pass