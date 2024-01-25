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

export function slugify(str: string) {
  return String(str)
    .normalize("NFKD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
}

export type QueryStringifyParam = {
  [key: string]: string | number | string[] | QueryStringifyParam;
};

export function queryStringify(
  object: QueryStringifyParam,
  parentKey: string | null = null
): string {
  return Object.keys(object)
    .map((key) => {
      const value = object[key];

      if (parentKey) {
        key = `${parentKey}[${key}]`;
      }

      if (value && typeof value === "object") {
        return queryStringify(value as QueryStringifyParam, key);
      }

      if (Array.isArray(value)) {
        return value
          .map((item) => `${key}[]=${encodeURIComponent(String(item))}`)
          .join("&");
      }

      return `${key}=${encodeURIComponent(String(value))}`;
    })
    .join("&");
}

export function htmlToPlainText(htmlString: string) {
  // if (!document) {
  //   return htmlString;
  // }
  // const html = new DOMParser().parseFromString(htmlString, "text/html");
  // return html.body.textContent || htmlString;
  let str = htmlString;

  str = str.replace(/<[^>]*>?/g, "");
  return str;
}

export function capitalizeString(text: string) {
  return text.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
}
