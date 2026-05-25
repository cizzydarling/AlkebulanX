from fastapi import APIRouter

from app.core.countries import COUNTRY_OPTIONS


router = APIRouter(prefix="/countries", tags=["Countries"])


@router.get("")
def list_countries():
    return COUNTRY_OPTIONS