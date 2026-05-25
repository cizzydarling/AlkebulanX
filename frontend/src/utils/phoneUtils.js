export function detectPhoneMeta(phone) {
  if (!phone) return {};

  const cleaned = phone.replace(/\s+/g, "");

  // Mali
  if (cleaned.startsWith("+223") || cleaned.startsWith("223")) {
    return {
      country: "Mali",
      network: "Orange Money",
    };
  }

  // Ghana
  if (cleaned.startsWith("+233") || cleaned.startsWith("233")) {
    if (cleaned.includes("024") || cleaned.includes("054")) {
      return { country: "Ghana", network: "MTN" };
    }
    return { country: "Ghana" };
  }

  // Nigeria
  if (cleaned.startsWith("+234") || cleaned.startsWith("234")) {
    return { country: "Nigeria" };
  }

  return {};
}