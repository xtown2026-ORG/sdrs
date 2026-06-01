import { GOLD_RATE_CACHE_TTL_MS, LIVE_CHENNAI_SOURCE_URL } from './constants.js';
import { parseLiveChennaiRates } from './parser.js';
import { getStoredRates, readRateStore, saveRates } from './store.js';

const buildFetchOptions = () => ({
  method: 'GET',
  headers: {
    'user-agent': 'SDRS Gold Rates Bot/1.0',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
  },
});

const isFreshEnough = (updatedAt) => {
  if (!updatedAt) {
    return false;
  }

  const timestamp = new Date(updatedAt).getTime();
  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp < GOLD_RATE_CACHE_TTL_MS;
};

export const fetchLiveChennaiRates = async () => {
  const response = await fetch(LIVE_CHENNAI_SOURCE_URL, buildFetchOptions());

  if (!response.ok) {
    throw new Error(`LiveChennai request failed with status ${response.status}`);
  }

  const html = await response.text();
  return parseLiveChennaiRates(html);
};

export const getChennaiRates = async ({ forceRefresh = false } = {}) => {
  const store = await readRateStore();
  const storedRates = store.current;

  if (!forceRefresh && storedRates && isFreshEnough(storedRates.updatedAt)) {
    return {
      payload: storedRates,
      source: 'live',
    };
  }

  try {
    const liveRates = await fetchLiveChennaiRates();
    let savedRates = liveRates;

    try {
      savedRates = await saveRates(liveRates, 'livechennai');
    } catch (storageError) {
      console.error('Failed to persist Chennai market rates:', storageError);
    }

    return {
      payload: savedRates,
      source: 'live',
    };
  } catch (error) {
    const fallbackRates = await getStoredRates();
    if (fallbackRates) {
      return {
        payload: fallbackRates,
        source: 'saved',
        error,
      };
    }

    throw error;
  }
};
