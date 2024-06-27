import { QueryState } from "@/types/data";

export function formatPrice(price: number) {
  const priceFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
  return priceFormatter.format(price);
}

export function formatPriceAcro(value: number) {
  if (value > 999999999) {
    return `${(Math.abs(value) / 1000000000).toFixed(0)} M`;
  }
  if (value > 999999) {
    return `${(Math.abs(value) / 1000000).toFixed(0)} jt`;
  }
  if (value > 999) {
    return `${(Math.abs(value) / 1000).toFixed(0)} rb`;
  }
  return `${Math.abs(value)}`;
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
  [key: string]: string | number | string[] | number[] | QueryStringifyParam;
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

export function queryStateToQueryString<T>(state: Partial<QueryState<T>>) {
  const queryObject: QueryStringifyParam = {};

  if (state.alg) {
    queryObject["alg"] = state.alg;
  }
  if (state.limit) {
    queryObject["limit"] = state.limit;
  }
  if (state.with) {
    queryObject["with"] = state.with;
  }
  if (state.withCount) {
    queryObject["withCount"] = state.withCount;
  }
  if (state.withAvgs) {
    queryObject["withAvgs"] = state.withAvgs.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.relation]: curr.field,
      };
    }, {} as QueryStringifyParam);
  }
  if (state.orderBy) {
    queryObject["orderBy"] = {
      [state.orderBy.field]: state.orderBy.value,
    };
  }
  if (state.filters) {
    queryObject["filters"] = state.filters.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.field]: `${curr.operator};${curr.value}`,
      };
    }, {} as QueryStringifyParam);
  }
  if (state.search) {
    queryObject["search"] = {
      [state.search.field]: state.search.value,
    };
  }
  if (state.page) {
    queryObject["page"] = state.page;
  }

  return queryStringify(queryObject);
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

export function generatePaginationArray(
  currentPage: number,
  lastPage: number,
  maxVisibleButtons: number
) {
  const paginationArray = [];

  if (lastPage <= maxVisibleButtons) {
    for (let i = 1; i <= lastPage; i++) {
      paginationArray.push(i);
    }
  } else {
    if (currentPage <= Math.ceil(maxVisibleButtons / 2)) {
      // Display buttons from the beginning
      for (let i = 1; i <= maxVisibleButtons - 1; i++) {
        paginationArray.push(i);
      }
      paginationArray.push("...");
      paginationArray.push(lastPage);
    } else if (currentPage >= lastPage - Math.floor(maxVisibleButtons / 2)) {
      // Display buttons from the end
      paginationArray.push(1);
      paginationArray.push("...");
      for (
        let i = lastPage - Math.floor(maxVisibleButtons / 2);
        i <= lastPage;
        i++
      ) {
        paginationArray.push(i);
      }
    } else {
      // Display buttons with ellipses in the middle
      paginationArray.push(1);
      paginationArray.push("...");
      for (
        let i = currentPage - Math.floor(maxVisibleButtons / 2) + 1;
        i <= currentPage + Math.floor(maxVisibleButtons / 2) - 1;
        i++
      ) {
        paginationArray.push(i);
      }
      paginationArray.push("...");
      paginationArray.push(lastPage);
    }
  }

  return paginationArray;
}
