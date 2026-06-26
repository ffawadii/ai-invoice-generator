import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';
import { api } from '../lib/axios';
import type { AxiosRequestConfig } from 'axios';

export function useGetQuery<T>(
  queryKey: QueryKey,
  url: string,
  config?: AxiosRequestConfig,
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const res = await api.get<T>(url, config);
      return res.data;
    },
    ...options,
  });
}
