import { getPaginatedData } from "@/lib/api/data";
import {
  QueryStringifyParam,
  queryStateToQueryString,
  queryStringify,
} from "@/lib/formater";
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
  config: { enabled?: boolean; token?: string; queryKey?: unknown[] } = {}
) {
  const { enabled, token, queryKey } = config;

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
    queryKey: queryKey
      ? [...queryKey, debouncedQueryState]
      : [path, debouncedQueryState],
    queryFn: () =>
      getPaginatedData<T>(
        path,
        queryStateToQueryString(debouncedQueryState),
        token
      ),
    keepPreviousData: true,
    enabled: enabled,
  });

  const requestData = queryResult.data;

  const summaryData = !!requestData
    ? {
        from: requestData?.from,
        to: requestData?.to,
        total: requestData?.total,
        last_page: requestData?.last_page,
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

  const setFilter = (
    vals:
      | {
          field: keyof T;
          operator: Required<QueryState<T>>["filters"][number]["operator"];
          value: string | number | null;
        }[]
      | null
  ) => {
    return setQueryState((prev) => {
      const { filters, ...rest } = prev;
      if (!vals) {
        return rest;
      }

      const filtered = (filters || []).filter(
        (fil) =>
          !vals.some(
            (val) => val.field === fil.field && val.operator === fil.operator
          )
      );

      const nonEmptyNewFilters = vals.filter((val) => !!val.value) as Required<
        QueryState<T>
      >["filters"];

      return {
        ...rest,
        filters: [...filtered, ...nonEmptyNewFilters],
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

  const availablePages = Array.from(
    { length: requestData?.last_page ?? 0 },
    (_, i) => i + 1
  );

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
    availablePages: availablePages,
  };
}
