import { apiClient } from '../lib/apiClient';

export function myLoans(accessToken) {
  return apiClient('/api/loans/me', { accessToken });
}

export function createLoan(accessToken, { userEmail, copyId }) {
  return apiClient('/api/loans', {
    method: 'POST',
    accessToken,
    body: { userEmail, copyId },
  });
}

export function returnLoan(accessToken, copyId) {
  return apiClient(`/api/loans/${copyId}/return`, {
    method: 'PATCH',
    accessToken,
  });
}
