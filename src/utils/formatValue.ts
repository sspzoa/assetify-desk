// 값을 표시용 문자열로 포맷팅하는 함수
export const formatValue = (value?: string | string[] | null) => {
  // 배열인 경우 쉼표로 구분하여 결합
  if (Array.isArray(value)) {
    const joined = value
      .filter((item) => item && item.trim().length > 0)
      .join(", ");
    return joined.trim().length > 0 ? joined : "-";
  }
  // 문자열인 경우 공백 제거 후 반환
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  // 값이 없으면 대시 반환
  return "-";
};
