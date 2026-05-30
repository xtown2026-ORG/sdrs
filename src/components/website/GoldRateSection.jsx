import React, { useEffect, useEffectEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, MapPin } from 'lucide-react';

const LIVE_CHENNAI_SOURCE_URL = import.meta.env.VITE_LIVE_RATE_SOURCE_URL || 'https://www.livechennai.com/gold_silverrate.asp';
const LIVE_CHENNAI_PROXY_URL = import.meta.env.VITE_LIVE_RATE_PROXY_URL || 'https://api.allorigins.win/raw?url=';
const GOLD_RATE_CACHE_KEY = 'sdrs-gold-rate-cache';
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const INDIA_TIME_ZONE = 'Asia/Kolkata';
const FALLBACK_MARKET_RATES = {
  gold24k: 15960,
  gold22k: 14630,
  gold18k: 11970,
  silver: 290,
  trends: {
    gold24k: 'up',
    gold22k: 'up',
    gold18k: 'up',
    silver: 'up'
  }
};
const EMPTY_RATES = {
  gold24k: null,
  gold22k: null,
  gold18k: null,
  silver: null,
  updatedAt: null,
  trends: {
    gold24k: 'up',
    gold22k: 'up',
    gold18k: 'up',
    silver: 'up'
  }
};

const getCurrentDate = () => new Date();

const getIndiaDateKey = (date = getCurrentDate()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);

const formatDisplayDate = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: INDIA_TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);

const formatDisplayTime = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: INDIA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date).toUpperCase();

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
    maximumFractionDigits: hasDecimals ? 2 : 0
  }).format(numericValue);
};

const parseNumericRate = (value) => {
  if (!value) {
    return null;
  }

  const sanitizedValue = value.replace(/,/g, '').trim();
  const numericValue = Number(sanitizedValue);
  return Number.isNaN(numericValue) ? null : numericValue;
};

const extractLiveChennaiTableRows = (html) => {
  const rowPattern = /(\d{2}\/[A-Za-z]{3}\/\d{4})\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)/g;
  const rows = [];
  let match;

  while ((match = rowPattern.exec(html)) !== null) {
    rows.push({
      date: match[1],
      gold24k1g: parseNumericRate(match[2]),
      gold24k8g: parseNumericRate(match[3]),
      gold22k1g: parseNumericRate(match[4]),
      gold22k8g: parseNumericRate(match[5])
    });
  }

  return rows;
};

const extractSilverRows = (html) => {
  const silverSectionMatch = html.match(/Chennai Silver Rate[\s\S]*?Date Silver 1 Gm Ready Silver \(1 Kg\)([\s\S]*?)##\s+Gold Rate in Chennai/i);
  if (!silverSectionMatch) {
    return [];
  }

  const rowPattern = /(\d{2}\/[A-Za-z]{3}\/\d{4})\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)/g;
  const rows = [];
  let match;

  while ((match = rowPattern.exec(silverSectionMatch[1])) !== null) {
    rows.push({
      date: match[1],
      silver1g: parseNumericRate(match[2]),
      silver1kg: parseNumericRate(match[3])
    });
  }

  return rows;
};

const parseLiveChennaiUpdatedAt = (html) => {
  const updateMatch = html.match(/Last Update Time:\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}:\d{2}:\d{2}\s*[AP]M)/i);
  if (!updateMatch) {
    return getCurrentDate();
  }

  const [, day, month, year, time] = updateMatch;
  const normalizedTime = time.toUpperCase().replace(/\s+/g, ' ');
  return new Date(`${year}-${month}-${day}T${convertTo24HourTime(normalizedTime)}+05:30`);
};

const convertTo24HourTime = (timeString) => {
  const timeMatch = timeString.match(/(\d{1,2}):(\d{2}):(\d{2})\s*([AP]M)/i);
  if (!timeMatch) {
    return '00:00:00';
  }

  let [, hour, minute, second, meridiem] = timeMatch;
  let normalizedHour = Number(hour);

  if (meridiem.toUpperCase() === 'PM' && normalizedHour !== 12) {
    normalizedHour += 12;
  }

  if (meridiem.toUpperCase() === 'AM' && normalizedHour === 12) {
    normalizedHour = 0;
  }

  return `${String(normalizedHour).padStart(2, '0')}:${minute}:${second}`;
};

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
    lastUpdatedDate: '-- --- ----'
  });
  const [loading, setLoading] = useState(true);
  const [fetchStatus, setFetchStatus] = useState('idle');

  const buildFallbackPayload = () => ({
    ...FALLBACK_MARKET_RATES,
    updatedAt: getCurrentDate().toISOString()
  });

  const applyRates = (payload) => {
    const dateObj = payload.updatedAt ? new Date(payload.updatedAt) : getCurrentDate();

    setRates((prev) => ({
      ...prev,
      ...payload,
      lastUpdated: formatDisplayTime(dateObj),
      lastUpdatedDate: formatDisplayDate(dateObj),
      trends: payload.trends || prev.trends
    }));
  };

  const getCachedRates = () => {
    try {
      const cachedRates = localStorage.getItem(GOLD_RATE_CACHE_KEY);
      if (!cachedRates) {
        return null;
      }

      const parsedCache = JSON.parse(cachedRates);
      if (!parsedCache?.payload) {
        return null;
      }

      if (parsedCache.dateKey !== getIndiaDateKey()) {
        return null;
      }

      return parsedCache.payload;
    } catch (cacheError) {
      console.error('Failed to read cached gold rates:', cacheError);
      return null;
    }
  };

  const buildLiveChennaiRates = (html) => {
    const goldRows = extractLiveChennaiTableRows(html);
    const silverRows = extractSilverRows(html);

    if (goldRows.length < 1 || silverRows.length < 1) {
      throw new Error('LiveChennai page format changed');
    }

    const todayGold = goldRows[0];
    const previousGold = goldRows[1] || goldRows[0];
    const todaySilver = silverRows[0];
    const previousSilver = silverRows[1] || silverRows[0];
    const gold18k = Math.round((todayGold.gold24k1g * 0.75));
    const previous18k = Math.round((previousGold.gold24k1g * 0.75));
    const updatedAt = parseLiveChennaiUpdatedAt(html);

    return {
      gold24k: todayGold.gold24k1g,
      gold22k: todayGold.gold22k1g,
      gold18k,
      silver: todaySilver.silver1g,
      updatedAt: updatedAt.toISOString(),
      trends: {
        gold24k: todayGold.gold24k1g >= previousGold.gold24k1g ? 'up' : 'down',
        gold22k: todayGold.gold22k1g >= previousGold.gold22k1g ? 'up' : 'down',
        gold18k: gold18k >= previous18k ? 'up' : 'down',
        silver: todaySilver.silver1g >= previousSilver.silver1g ? 'up' : 'down'
      }
    };
  };

  const fetchLiveChennaiRates = async () => {
    const response = await fetch(`${LIVE_CHENNAI_PROXY_URL}${encodeURIComponent(LIVE_CHENNAI_SOURCE_URL)}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });

    if (!response.ok) {
      throw new Error('LiveChennai request failed');
    }

    const html = await response.text();
    const payload = buildLiveChennaiRates(html);

    localStorage.setItem(
      GOLD_RATE_CACHE_KEY,
      JSON.stringify({
        dateKey: getIndiaDateKey(),
        payload
      })
    );

    return payload;
  };

  const fetchRates = useEffectEvent(async ({ isBackgroundRefresh = false } = {}) => {
    if (!isBackgroundRefresh) {
      setLoading(true);
    }

    setFetchStatus((currentStatus) => (currentStatus === 'live' && isBackgroundRefresh ? currentStatus : 'refreshing'));

    try {
      const payload = await fetchLiveChennaiRates();
      applyRates(payload);
      setFetchStatus('live');
    } catch (err) {
      console.error('Failed to fetch Chennai market rates:', err);
      const cachedPayload = getCachedRates();
      const fallbackPayload = cachedPayload || buildFallbackPayload();

      applyRates(fallbackPayload);
      setFetchStatus(cachedPayload ? 'stale' : 'error');
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    const cachedPayload = getCachedRates();

    if (cachedPayload) {
      applyRates(cachedPayload);
      setFetchStatus('stale');
      setLoading(false);
    } else {
      applyRates(buildFallbackPayload());
    }

    fetchRates({ isBackgroundRefresh: false });

    const interval = setInterval(() => {
      fetchRates({ isBackgroundRefresh: true });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

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
            trend={rates.trends?.gold24k || 'up'}
            delay={0.1}
            isLoading={loading}
            status={fetchStatus}
          />
          <RateCard
            title="Gold 22K"
            weight="1 Gram"
            rate={rates.gold22k}
            trend={rates.trends?.gold22k || 'up'}
            delay={0.2}
            isLoading={loading}
            status={fetchStatus}
          />
          <RateCard
            title="Gold 18K"
            weight="1 Gram"
            rate={rates.gold18k}
            trend={rates.trends?.gold18k || 'up'}
            delay={0.3}
            isLoading={loading}
            status={fetchStatus}
          />
          <RateCard
            title="Silver"
            weight="1 Gram"
            rate={rates.silver}
            trend={rates.trends?.silver || 'up'}
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
