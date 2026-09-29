'use client';
import axios, { AxiosInstance } from 'axios';

import { addInterceptors } from './apiInterceptors';

const identityApiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_IDENTITY_SERVICE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-platform-name': 'admin-dashboard',
  },
  withCredentials: true,
});

const adminApiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// B2C API Client for Banner Config endpoints
const b2cApiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

addInterceptors(identityApiClient, 'IdentityApiClient');
addInterceptors(adminApiClient, 'AdminApiClient');
addInterceptors(b2cApiClient, 'B2CApiClient', {
  requireAuth: false,
  signOutOn401: false,
});

export { identityApiClient, adminApiClient, b2cApiClient };
