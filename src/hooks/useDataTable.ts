import { getPaginatedData } from "@/lib/api/data";
import { QueryStringifyParam, queryStringify } from "@/lib/formater";
import { QueryState } from "@/types/data";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import useDebounce from "./useDebounce";

const defaultQueryState = {
  limit: 10,
  page: 1,
};

export default function useDataTable<T>(
  path: string,
  initialQueryState?: Partial<QueryState<T>>,
  enabled?: boolean
) {
  const [queryState, setQueryState] = useState<QueryState<T>>(
    initialQueryState
      ? {
          ...defaultQueryState,
          ...initialQueryState,
        }
      : defaultQueryState
  );

  const debouncedQueryState = useDebounce(queryState, 200);

  const queryResult = useQuery({
    queryKey: [path, debouncedQueryState],
    queryFn: () =>
      getPaginatedData<T>(path, queryStateToQueryString(debouncedQueryState)),
    keepPreviousData: true,
    enabled: enabled,
  });

  const requestData = queryResult.data;

  const summaryData = !!requestData
    ? {
        from: requestData?.from,
        to: requestData?.to,
        total: requestData?.total,
      }
    : undefined;

  const resetQueryState = () => {
    return setQueryState(defaultQueryState);
  };

  const setSearchKey = (val: Required<QueryState<T>>["search"] | null) => {
    return setQueryState((prev) => {
      const { search, ...rest } = prev;
      if (!val || !val.field || !val.value || val.value === "") {
        return {
          ...rest,
          page: 1,
        };
      }
      return {
        ...rest,
        search: val,
        page: 1,
      };
    });
  };

  const setOrderBy = (val: Required<QueryState<T>>["orderBy"] | null) => {
    return setQueryState((prev) => {
      const { orderBy, ...rest } = prev;
      if (!val || !val.field || !val.value) {
        if (!initialQueryState?.orderBy) {
          return {
            ...rest,
            page: 1,
          };
        }
        return {
          ...rest,
          orderBy: initialQueryState.orderBy,
          page: 1,
        };
      }
      return {
        ...rest,
        orderBy: val,
        page: 1,
      };
    });
  };

  const setFilter = (val: { field: keyof T; value: string | null } | null) => {
    return setQueryState((prev) => {
      const { filters, ...rest } = prev;
      if (!val) {
        return rest;
      }

      const filtered = (filters || []).filter((fil) => fil.field !== val.field);
      const filterValue = val.value;

      if (!filterValue) {
        return {
          ...rest,
          filters: filtered,
        };
      }

      return {
        ...rest,
        filters: [...filtered, { field: val.field, value: filterValue }],
      };
    });
  };

  const setLimit = (val: Required<QueryState<T>>["limit"] | null) => {
    return setQueryState((prev) => {
      if (!val) {
        return prev;
      }
      return {
        ...prev,
        limit: val,
        page: 1,
      };
    });
  };

  const nextPageAvailable =
    requestData && queryState.page < requestData.last_page;

  const nextPage = () => {
    if (!requestData) {
      return;
    }
    if (queryState.page >= requestData.last_page) {
      return;
    }
    return setQueryState((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };

  const previousPageAvailable = queryState.page > 1;

  const previousPage = () => {
    if (queryState.page <= 1) {
      return;
    }
    return setQueryState((prev) => ({
      ...prev,
      page: prev.page - 1,
    }));
  };

  return {
    ...queryResult,
    data: requestData?.data,
    queryState: queryState,
    resetQueryState: resetQueryState,
    nextPageAvailable: nextPageAvailable,
    nextPage: nextPageAvailable ? nextPage : undefined,
    previousPageAvailable: previousPageAvailable,
    previousPage: previousPageAvailable ? previousPage : undefined,
    summaryData: summaryData,
    setSearchKey: setSearchKey,
    setOrderBy: setOrderBy,
    setLimit: setLimit,
    setFilter: setFilter,
  };
}

function queryStateToQueryString<T>(state: QueryState<T>) {
  const queryObject: QueryStringifyParam = {};

  if (state.limit) {
    queryObject["limit"] = state.limit;
  }
  if (state.with) {
    queryObject["with"] = state.with;
  }
  if (state.withCount) {
    queryObject["withCount"] = state.withCount;
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
        [curr.field]: curr.value,
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
