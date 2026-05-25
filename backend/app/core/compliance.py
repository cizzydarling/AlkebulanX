from typing import Dict, List


HIGH_RISK_REASONS = {
    "business investment",
    "crypto",
    "loan repayment",
    "unknown",
}

DAILY_REVIEW_THRESHOLD_CAD = 1000
SINGLE_TRANSFER_REVIEW_THRESHOLD_CAD = 500


def normalize_text(value: str | None) -> str:
    return (value or "").strip().lower()


def evaluate_transfer_compliance(
    send_amount: float,
    reason: str | None = None,
) -> Dict:
    flags: List[str] = []

    normalized_reason = normalize_text(reason)

    if send_amount >= SINGLE_TRANSFER_REVIEW_THRESHOLD_CAD:
        flags.append("large_single_transfer")

    if normalized_reason in HIGH_RISK_REASONS:
        flags.append("high_risk_reason")

    if not normalized_reason:
        flags.append("missing_transfer_reason")

    if flags:
        return {
            "review_status": "manual_review_required",
            "flags": flags,
            "message": "Transfer should be reviewed before provider handoff.",
        }

    return {
        "review_status": "not_required",
        "flags": [],
        "message": "No manual review required for MVP rules.",
    }