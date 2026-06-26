import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { api } from '../lib/axios';
import type { AxiosRequestConfig } from 'axios';

export interface UpdateVariables<TData = any> {
  url: string;
  data: TData;
  config?: AxiosRequestConfig;
}

export function useUpdateMutation<TResponse = any, TData = any>(
  options?: UseMutationOptions<TResponse, Error, UpdateVariables<TData>>
) {
  return useMutation<TResponse, Error, UpdateVariables<TData>>({
    mutationFn: async ({ url, data, config }) => {
      const res = await api.patch<TResponse>(url, data, config);
      return res.data;
    },
    ...options,
  });
}
