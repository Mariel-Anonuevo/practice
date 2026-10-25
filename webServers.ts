import path from 'path';

// Directories ng mga servers
const backendPath = path.resolve(__dirname, '../../FE-FIXINGGGG/FOMS-System-Repository/foms-backend/FOMS.Api');
const fomsFrontendPath = path.resolve(__dirname, '../../FE-FIXINGGGG/FOMS-System-Repository/foms-frontend');
const speedpayPortalPath = path.resolve(__dirname, '../../FE-FIXINGGGG/FOMS-System-Repository/speedpay-portal');

export const backendServer = {
  command: 'dotnet run',
  cwd: backendPath,
  url: 'http://localhost:5007/api/speedpay/clients',
  reuseExistingServer: true,
  timeout: 120 * 1000,
};

export const fomsFrontendServer = {
  command: 'npm run dev',
  cwd: fomsFrontendPath,
  url: 'http://localhost:5173',
  reuseExistingServer: true,
  timeout: 120 * 1000,
};

export const speedpayPortalServer = {
  command: 'npm run dev',
  cwd: speedpayPortalPath,
  url: 'http://localhost:5174',
  reuseExistingServer: true,
  timeout: 120 * 1000,
};

export const allWebServers = [backendServer, fomsFrontendServer, speedpayPortalServer];
