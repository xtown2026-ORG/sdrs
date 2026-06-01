import React, { useEffect, useEffectEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, MapPin } from 'lucide-react';

const GOLD_RATE_ENDPOINT = '/api/v1/gold-rates/chennai';
const GOLD_RATE_CACHE_KEY = 'sdrs-chennai-market-rates';
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const INDIA_TIME_ZONE = 'Asia/Kolkata';
const FALLBACK_MARKET_RATES = {
  gold24k: '15818',
  gold22k: '14500',
  gold18k: '11864',
  silver: '290',
  updatedAt: '2026-06-01T04:08:48.000Z',
};
const EMPTY_RATES = {
  gold24k: null,
  gold22k: null,
  gold18k: null,
  silver: null,
  updatedAt: null,
};

const getCurrentDate = () => new Date();

const formatDisplayDate = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: INDIA_TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

const formatDisplayTime = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: INDIA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .toUpperCase();

const formatRate = (value) => {
  if (value === null || value === undefined || value === '') {
    return '---';
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return value;
  }

  const hasDecimals = !Number.isInteger(numericValue);

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(numericValue);
};

const parseRateValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
};

const isValidRatePayload = (payload) =>
  Boolean(
    payload &&
      payload.updatedAt &&
      payload.gold24k !== null &&
      payload.gold24k !== undefined &&
      payload.gold24k !== '' &&
      payload.gold22k !== null &&
      payload.gold22k !== undefined &&
      payload.gold22k !== '' &&
      payload.gold18k !== null &&
      payload.gold18k !== undefined &&
      payload.gold18k !== '' &&
      payload.silver !== null &&
      payload.silver !== undefined &&
      payload.silver !== ''
  );

const RateCard = ({ title, weight, rate, trend, delay, isLoading, status }) => {
  const badgeLabel = isLoading ? 'Refreshing' : status === 'live' ? 'Live Chennai Market' : 'Saved Rate';
  const badgeClassName = isLoading
    ? 'bg-brand-red/10 text-brand-red'
    : trend === 'down'
      ? 'bg-brand-red/10 text-brand-red'
      : status === 'live'
        ? 'bg-green-500/10 text-green-500'
        : 'bg-amber-500/10 text-amber-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card gold-border-animate flex flex-col items-center text-center p-8 group relative"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {trend === 'down' ? <TrendingDown size={64} className="text-brand-red" /> : <TrendingUp size={64} className="text-brand-red" />}
      </div>

      <span className="text-brand-red font-bold uppercase tracking-widest text-xs mb-4">{title}</span>
      <h3 className={`text-4xl md:text-5xl font-bold text-brand-text mb-2 transition-opacity ${isLoading ? 'opacity-70 animate-pulse' : 'opacity-100'}`}>
        &#8377;{formatRate(rate)}
      </h3>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
        / {weight}
      </p>

      <div className={`mt-6 flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full ${badgeClassName}`}>
        <span>{status === 'live' ? '\u25CF' : trend === 'down' ? '-' : '+'}</span>
        <span>{badgeLabel}</span>
      </div>
    </motion.div>
  );
};

const GoldRateSection = () => {
  const [rates, setRates] = useState({
    ...EMPTY_RATES,
    lastUpdated: '--:--',
    lastUpdatedDate: '-- --- ----',
  });
  const [loading, setLoading] = useState(true);
  const [fetchStatus, setFetchStatus] = useState('idle');
  const [previousRates, setPreviousRates] = useState(null);

  const getCachedRates = () => {
    try {
      const cachedRates = localStorage.getItem(GOLD_RATE_CACHE_KEY);
      if (!cachedRates) {
        return null;
      }

      const parsedCache = JSON.parse(cachedRates);
      return isValidRatePayload(parsedCache) ? parsedCache : null;
    } catch (error) {
      console.error('Failed to read cached Chennai market rates:', error);
      return null;
    }
  };

  const saveCachedRates = (payload) => {
    try {
      localStorage.setItem(GOLD_RATE_CACHE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to cache Chennai market rates:', error);
    }
  };

  const applyRates = (payload) => {
    const dateObj = payload.updatedAt ? new Date(payload.updatedAt) : getCurrentDate();

    setPreviousRates((currentRates) => ({
      gold24k: parseRateValue(currentRates?.gold24k),
      gold22k: parseRateValue(currentRates?.gold22k),
      gold18k: parseRateValue(currentRates?.gold18k),
      silver: parseRateValue(currentRates?.silver),
    }));

    setRates((prev) => ({
      ...prev,
      ...payload,
      lastUpdated: formatDisplayTime(dateObj),
      lastUpdatedDate: formatDisplayDate(dateObj),
    }));
  };

  const buildTrends = () => {
    const currentGold24k = parseRateValue(rates.gold24k);
    const currentGold22k = parseRateValue(rates.gold22k);
    const currentGold18k = parseRateValue(rates.gold18k);
    const currentSilver = parseRateValue(rates.silver);

    return {
      gold24k:
        previousRates?.gold24k !== null && previousRates?.gold24k !== undefined && currentGold24k !== null
          ? currentGold24k >= previousRates.gold24k
            ? 'up'
            : 'down'
          : 'up',
      gold22k:
        previousRates?.gold22k !== null && previousRates?.gold22k !== undefined && currentGold22k !== null
          ? currentGold22k >= previousRates.gold22k
            ? 'up'
            : 'down'
          : 'up',
      gold18k:
        previousRates?.gold18k !== null && previousRates?.gold18k !== undefined && currentGold18k !== null
          ? currentGold18k >= previousRates.gold18k
            ? 'up'
            : 'down'
          : 'up',
      silver:
        previousRates?.silver !== null && previousRates?.silver !== undefined && currentSilver !== null
          ? currentSilver >= previousRates.silver
            ? 'up'
            : 'down'
          : 'up',
    };
  };

  const fetchRates = useEffectEvent(async ({ isBackgroundRefresh = false } = {}) => {
    if (!isBackgroundRefresh) {
      setLoading(true);
    }

    setFetchStatus((currentStatus) => (currentStatus === 'live' && isBackgroundRefresh ? currentStatus : 'refreshing'));

    try {
      const response = await fetch(GOLD_RATE_ENDPOINT, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });

      if (!response.ok) {
        throw new Error('Chennai gold rate request failed');
      }

      const payload = await response.json();
      if (!isValidRatePayload(payload)) {
        throw new Error('Chennai gold rate payload was incomplete');
      }

      const source = response.headers.get('X-Rate-Source') === 'live' ? 'live' : 'saved';

      applyRates(payload);
      saveCachedRates(payload);
      setFetchStatus(source);
    } catch (error) {
      console.error('Failed to fetch Chennai market rates:', error);
      const cachedRates = getCachedRates() || FALLBACK_MARKET_RATES;
      applyRates(cachedRates);
      setFetchStatus('saved');
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    const cachedRates = getCachedRates();
    if (cachedRates) {
      applyRates(cachedRates);
      setFetchStatus('saved');
      setLoading(false);
    } else {
      applyRates(FALLBACK_MARKET_RATES);
      setFetchStatus('saved');
      setLoading(false);
    }

    fetchRates({ isBackgroundRefresh: false });

    const interval = setInterval(() => {
      fetchRates({ isBackgroundRefresh: true });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const trends = buildTrends();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(166,124,0,0.05)_0%,transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-brand-red mb-4">
              <MapPin size={18} />
              <span className="font-bold tracking-widest uppercase text-xs">Chennai Market</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-text">
              Today's <span className="text-brand-red italic">Gold Rate</span>
            </h2>
            <p className="text-gray-600 mt-4 font-body max-w-xl">
              Chennai Market Gold & Silver Rates. Prices are automatically updated based on the latest Chennai bullion market rates.
            </p>
            <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${fetchStatus === 'live' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
              <span className={fetchStatus === 'live' ? 'animate-pulse' : ''}>&#9679;</span>
              <span>{fetchStatus === 'live' ? 'Live Chennai Market' : 'Saved Chennai Market Rates'}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-white/20 border border-black/5 px-6 py-3 rounded-2xl">
              <Clock size={18} className="text-brand-red" />
              <span className="text-sm text-gray-600">
                Last Updated: <span className={`text-brand-text font-bold ${loading ? 'animate-pulse' : ''}`}>{rates.lastUpdatedDate}, {rates.lastUpdated}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <RateCard
            title="Gold 24K"
            weight="1 Gram"
            rate={rates.gold24k}
            trend={trends.gold24k}
            delay={0.1}
            isLoading={loading}
            status={fetchStatus}
          />
          <RateCard
            title="Gold 22K"
            weight="1 Gram"
            rate={rates.gold22k}
            trend={trends.gold22k}
            delay={0.2}
            isLoading={loading}
            status={fetchStatus}
          />
          <RateCard
            title="Gold 18K"
            weight="1 Gram"
            rate={rates.gold18k}
            trend={trends.gold18k}
            delay={0.3}
            isLoading={loading}
            status={fetchStatus}
          />
          <RateCard
            title="Silver"
            weight="1 Gram"
            rate={rates.silver}
            trend={trends.silver}
            delay={0.4}
            isLoading={loading}
            status={fetchStatus}
          />
        </div>

        <div className="mt-12 p-6 glass-premium rounded-2xl border-brand-red/20 bg-brand-red/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-brand-text font-bold">Best Value Guarantee</p>
              <p className="text-gray-600 text-sm">We offer the highest price for your gold in Chennai.</p>
            </div>
          </div>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-premium !py-3 !px-8 whitespace-nowrap"
          >
            Lock This Rate
          </button>
        </div>
      </div>
    </section>
  );
};

export default GoldRateSection;
