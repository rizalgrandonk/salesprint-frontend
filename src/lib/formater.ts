export function formatPrice(price: number) {
  const priceFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  });
  return priceFormatter.format(price);
}
