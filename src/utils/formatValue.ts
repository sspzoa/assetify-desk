export const formatValue = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    const joined = value.filter((item) => item && item.trim().length > 0).join(", ");
    return joined.trim().length > 0 ? joined : "-";
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return "-";
};
