export function formatPrice(price: number) {
  const priceFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
  return priceFormatter.format(price);
}

export function ratingToArray(rating: number, maxRating: number = 5) {
  // Calculate the integer and decimal parts of the rating
  const integerPart = Math.floor(rating);
  const decimalPart = rating - integerPart;

  // Create an array of star icons for the integer part of the rating
  const stars: number[] = [];
  for (let i = 0; i < integerPart; i++) {
    stars.push(1);
  }

  if (decimalPart > 0) {
    stars.push(decimalPart);
  }

  for (let i = 0; i < maxRating - Math.ceil(rating); i++) {
    stars.push(0);
  }

  return stars.sort((a, b) => b - a);
}
