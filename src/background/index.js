console.log('hello world background todo something~');

import axios from 'axios';
import { joaat } from '../utils/hash';
import { domainFromUrl } from '../utils/url';
import { onMessage, sendMessageToContentScript } from '../utils/extension-messenger';
import browser from 'webextension-polyfill';

let seedPromise = null;
// eslint-disable-next-line no-unused-vars
let user = null;

const STATUS_UNAUTHORIZED = 401;
const ERROR_TOKEN_EXPIRED = 10524;
const AUTH_CLIENT_ID = 1345;

function initAuth() {
  axios.defaults.headers.common = {
    'X-SimplyCodes-Version': '1.3.5',
  };

  axios.defaults.withCredentials = true;

  let isRetrying = false;

  const refreshToken = (initialRequestConfig) => {
    return axios
      .post(`${process.env.VUE_APP_API_BASE_URL}/auth/login`, {
        grant_type: 'refresh_token',
        rememberMe: true,
        client_id: AUTH_CLIENT_ID,
      })
      .then((response) => {
        if (initialRequestConfig) {
          return axios(initialRequestConfig);
        }
        return response;
      })
      .catch((error) => {
        this.loginError = error.message || 'Access denied';
      });
  };

  const logOut = async () => {
    await axios.post(`https://api.simplycodes.com/v1/auth/logout`);
    user = null;
  };

  const fetchLoggedInUser = async () => {
    const response = await axios.get(`https://api.simplycodes.com/v1/user`);

    if (response.data.users.length > 0) {
      user = response.data.users[0];
    } else {
      // Not logged in, create a guest user
      createGuestUser();
    }
  };

  // Creates a guest user to keep track of settings/etc
  const createGuestUser = async () => {
    const response =
      (await axios.post) <
      (`https://api.simplycodes.com/v1/auth/login`,
      {
        grant_type: 'guest',
        client_id: AUTH_CLIENT_ID,
        rememberMe: true,
        scopes: ['v1:guest'],
      });

    if (response.data?.profile) {
      user = {
        id: response.data.profile.id,
        profile: response.data.profile,
      };
    }
  };

  axios.interceptors.response.use(
    (value) => value,
    (error) =>
      new Promise((resolve, reject) => {
        if (error.response && error.response.status === STATUS_UNAUTHORIZED) {
          if (error.response.data?.errorCode === ERROR_TOKEN_EXPIRED && !isRetrying) {
            // Intercept expired auth token response, try to refresh, if successful, replay original request
            console.log('Need to refresh token when getting:', error.config.url);
            // console.log(error.config.headers);
            isRetrying = true;
            refreshToken(error.config)
              .then(resolve)
              .catch(reject)
              .finally(() => {
                isRetrying = false;
              });
          } else {
            logOut();
            reject(error);
          }
        } else {
          reject(error);
        }
      }),
  );

  fetchLoggedInUser();
}

const getMerchantIndex = () => {
  if (seedPromise) {
    return seedPromise;
  }

  const domainSeedUrl = browser.runtime.getURL('domains-seed.json');
  seedPromise = axios
    .get(domainSeedUrl)
    .then((response) => {
      const { merchants } = response.data;
      return merchants;
    })
    .then((result) => result || {});
  return seedPromise;
};

export const lookupMerchantIdFromURL = async (url) => {
  const result = {};
  if (url) {
    const domain = domainFromUrl(url);

    if (domain) {
      result.domain = domain;
      const hash = joaat(domain);
      await getMerchantIndex().then((merchants) => {
        result.merchantId = merchants[hash] ? parseInt(merchants[hash], 36) : undefined;
      });
    }
  }
  return result;
};

onMessage('DECODE_GOOGLE_URL', async (url) => {
  return fetch(url, { method: 'HEAD' })
    .then((result) => result.url || null)
    .catch(() => null);
});

onMessage('LOOK_UP_MERCHANT', async (url) => {
  const lookupPromise = new Promise((resolve) => {
    lookupMerchantIdFromURL(url)
      .then((lookupResults) => {
        if (!lookupResults.merchantId) {
          return resolve(null);
        }

        // Find the Merchant
        axios
          .get(`https://api.simplycodes.com/v1/merchant/${lookupResults.merchantId}`)
          .then((result) => {
            if (result.data.merchants.length > 0) {
              // If found, see if we have a green sitewide coupon for it
              axios
                .get(`https://api.simplycodes.com/v1/merchant/${lookupResults.merchantId}/promotions2`)
                .then((promoResults) => {
                  if (promoResults && promoResults.data && promoResults.data.promotions) {
                    const hasGreenSitewide = promoResults.data.promotions.some((promo) => {
                      return (promo.amountOff || promo.percentOff) && promo.isGreen & promo.is_storewide;
                    });

                    if (hasGreenSitewide) {
                      return resolve(result.data.merchants[0]);
                    }
                  }

                  return resolve(null);
                });
            } else {
              return resolve(null);
            }
          })
          .catch(() => {
            return resolve(null);
          });
      })
      .catch(() => {
        return resolve(null);
      });
  });

  return lookupPromise;
});

initAuth();

const onCompletedListener = (details) => {
  if (
    details.method === 'GET' &&
    details.url.includes('/search') &&
    details.url.includes('start=') &&
    details.url.includes('q=')
  ) {
    console.log(details.url);
    console.log('BG REFRESH', details.url);
    sendMessageToContentScript(details.tabId, 'REFRESH_PROMOS');
  }
};

chrome.webRequest.onCompleted.addListener(onCompletedListener, {
  urls: ['https://*.google.com/*'],
});
