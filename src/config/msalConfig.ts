import { Configuration, LogLevel } from '@azure/msal-browser';

// Detect if we're in development mode
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('lovable.app');

// Production redirect URI
const PROD_REDIRECT_URI = 'https://opportunitydash.onrender.com/auth/callback';

// Development redirect URI (current origin)
const DEV_REDIRECT_URI = `${window.location.origin}/auth/callback`;

export const msalConfig: Configuration = {
  auth: {
    clientId: 'b507bc53-ce4a-48cb-9fd2-6aa8c8e10464',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: isDevelopment ? DEV_REDIRECT_URI : PROD_REDIRECT_URI,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
        }
      },
      logLevel: isDevelopment ? LogLevel.Info : LogLevel.Error,
    },
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

export const isDev = isDevelopment;
