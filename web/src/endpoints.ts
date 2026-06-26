export const queryKeys = {
  invoices: ['invoices'],
  clients: ['clients'],
};

export const endpoints = {
  invoices: '/invoices',
  clients: '/clients',
  login: '/auth/login',
  register: '/auth/register',
  verifyOtp: '/auth/verify-otp',
  resendOtp: '/auth/resend-otp',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  chat: '/chat',
  invoiceStatus: (id: string) => `/invoices/${id}/status`,
  invoicePdf: (id: string) => `/invoices/${id}/pdf`,
  invoice: (id: string) => `/invoices/${id}`,
};
