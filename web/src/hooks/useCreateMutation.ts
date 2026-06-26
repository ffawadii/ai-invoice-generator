import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { api } from '../lib/axios';
import type { AxiosRequestConfig } from 'axios';

export interface CreateVariables<TData = any> {
  url: string;
  data: TData;
  config?: AxiosRequestConfig;
}

export function useCreateMutation<TResponse = any, TData = any>(
  options?: UseMutationOptions<TResponse, Error, CreateVariables<TData>>
) {
  return useMutation<TResponse, Error, CreateVariables<TData>>({
    mutationFn: async ({ url, data, config }) => {
      const res = await api.post<TResponse>(url, data, config);
      return res.data;
    },
    ...options,
  });
}
