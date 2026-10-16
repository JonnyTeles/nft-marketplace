const SCALE = 100_000_000n;
export function toUnits(value: string): bigint {
  const [whole = "0", fraction = ""] = value.split(".");
  return BigInt(whole) * SCALE + BigInt((fraction + "00000000").slice(0, 8));
}
export function fromUnits(value: bigint): string {
  const whole = value / SCALE;
  const fraction = (value % SCALE)
    .toString()
    .padStart(8, "0")
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}
export function multiplyEth(price: string, quantity: number) {
  return fromUnits(toUnits(price) * BigInt(quantity));
}
export function formatEth(value: string) {
  return `${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 4, minimumFractionDigits: 2 })} ETH`;
}
