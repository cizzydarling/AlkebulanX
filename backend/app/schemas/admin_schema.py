from typing import Optional

from pydantic import BaseModel


class AdminTransferDecision(BaseModel):
    note: Optional[str] = None