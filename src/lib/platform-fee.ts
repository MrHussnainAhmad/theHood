export type ProviderEmployeeRange = "1" | "2-5" | "5-10" | "10+";

export function getPlatformFeePercent(range?: string | null) {
  switch (range) {
    case "1":
      return 7;
    case "2-5":
      return 10;
    case "5-10":
      return 13;
    case "10+":
      return 15;
    default:
      return 15;
  }
}

