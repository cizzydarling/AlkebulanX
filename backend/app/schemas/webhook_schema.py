from typing import Any, Dict, Optional

from pydantic import BaseModel


class ProviderWebhookPayload(BaseModel):
    provider_reference: str
    status: str
    raw_payload: Optional[Dict[str, Any]] = None