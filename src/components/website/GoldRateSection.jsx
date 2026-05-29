import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, MapPin } from 'lucide-react';

const RATE_MODE = import.meta.env.VITE_RATE_MODE || 'goldapi';
const GOLD_API_KEY = import.meta.env.VITE_GOLD_API_KEY;
const GOLD_API_BASE_URL = import.meta.env.VITE_GOLD_API_BASE_URL || 'https://www.goldapi.io/api';
const GOLD_RATE_CACHE_KEY = 'sdrs-gold-rate-cache';
const DAILY_RATE_CONFIG = {
  gold24k: import.meta.env.VITE_DAILY_GOLD_24K || '15764',
  gold22k: import.meta.env.VITE_DAILY_GOLD_22K || '14450',
  gold18k: import.meta.env.VITE_DAILY_GOLD_18K || '11823',
  silver: import.meta.env.VITE_DAILY_SILVER || '275',
  updatedAt: import.meta.env.VITE_DAILY_RATE_UPDATED_AT || new Date().toLocaleDateString('en-GB'),
};

const RateCard = ({ title, weight, rate, trend, delay, mode }) => {
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
      <h3 className="text-4xl md:text-5xl font-bold text-brand-text mb-2">
        ₹{rate || '---'}
      </h3>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
        / {weight}
      </p>

      <div className={`mt-6 flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full ${trend === 'down' ? 'bg-brand-red/10 text-brand-red' : 'bg-green-500/10 text-green-500'}`}>
        {trend === 'up' ? '+' : '-'} {mode === 'live' ? 'Live Market' : 'Daily Rate'}
      </div>
    </motion.div>
  );
};

const GoldRateSection = () => {
  const [rates, setRates] = useState({
    gold24k: '15273',
    gold22k: '14000',
    gold18k: '11680',
    silver: '265',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    lastUpdatedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    trends: {
      gold24k: 'up',
      gold22k: 'up',
      gold18k: 'up',
      silver: 'up'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTodayCacheKey = () => new Date().toISOString().slice(0, 10);

  const parseRateDate = (value) => {
    if (!value) {
      return new Date();
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string') {
      const ddmmyyyyMatch = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch;
        return new Date(`${year}-${month}-${day}T00:00:00`);
      }
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const buildGoldApiRates = (goldData, silverData) => {
    const goldTrend = goldData.ch >= 0 ? 'up' : 'down';
    const silverTrend = silverData.ch >= 0 ? 'up' : 'down';

    return {
      gold24k: Math.round(goldData.price_gram_24k),
      gold22k: Math.round(goldData.price_gram_22k),
      gold18k: Math.round(goldData.price_gram_18k),
      silver: Math.round(silverData.price_gram_24k),
      updatedAt: goldData.timestamp ? new Date(goldData.timestamp * 1000).toISOString() : new Date().toISOString(),
      trends: {
        gold24k: goldTrend,
        gold22k: goldTrend,
        gold18k: goldTrend,
        silver: silverTrend
      }
    };
  };

  const applyRates = (payload) => {
    const dateObj = parseRateDate(payload.lastUpdated || payload.updatedAt);
    setRates(prev => ({
      ...prev,
      ...payload,
      lastUpdated: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastUpdatedDate: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      trends: payload.trends || prev.trends
    }));
  };

  const fetchGoldApiRates = async () => {
    const headers = {
      'Content-Type': 'application/json',
      'x-access-token': GOLD_API_KEY,
    };

    const [goldResponse, silverResponse] = await Promise.all([
      fetch(`${GOLD_API_BASE_URL}/XAU/INR`, { method: 'GET', headers }),
      fetch(`${GOLD_API_BASE_URL}/XAG/INR`, { method: 'GET', headers }),
    ]);

    if (!goldResponse.ok || !silverResponse.ok) {
      throw new Error('GoldAPI request failed');
    }

    const [goldData, silverData] = await Promise.all([
      goldResponse.json(),
      silverResponse.json(),
    ]);

    const payload = buildGoldApiRates(goldData, silverData);
    localStorage.setItem(
      GOLD_RATE_CACHE_KEY,
      JSON.stringify({
        dateKey: getTodayCacheKey(),
        payload,
      })
    );

    return payload;
  };

  const fetchRates = async () => {
    if (RATE_MODE === 'daily') {
      applyRates(DAILY_RATE_CONFIG);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      if (RATE_MODE === 'goldapi') {
        const cachedRates = localStorage.getItem(GOLD_RATE_CACHE_KEY);
        if (cachedRates) {
          const parsedCache = JSON.parse(cachedRates);
          if (parsedCache?.dateKey === getTodayCacheKey() && parsedCache?.payload) {
            applyRates(parsedCache.payload);
            setError(null);
            setLoading(false);
            return;
          }
        }

        if (!GOLD_API_KEY) {
          throw new Error('Missing GoldAPI key');
        }

        const payload = await fetchGoldApiRates();
        applyRates(payload);
        setError(null);
      } else {
        applyRates(DAILY_RATE_CONFIG);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch rates:', err);
      applyRates(DAILY_RATE_CONFIG);
      setError('Showing saved daily rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    if (RATE_MODE !== 'goldapi') {
      return undefined;
    }

    const interval = setInterval(fetchRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(166,124,0,0.05)_0%,transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-brand-red mb-4">
              <MapPin size={18} />
              <span className="font-bold tracking-widest uppercase text-xs">Coimbatore Market</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-text">
              Today's <span className="text-brand-red italic">Gold Rate</span>
            </h2>
            <p className="text-gray-600 mt-4 font-body max-w-xl">
              {RATE_MODE === 'goldapi'
                ? 'Coimbatore Rate (Based on Chennai Market). Prices refresh automatically from the gold market source and keep a saved daily fallback if the API is unavailable.'
                : 'Coimbatore Rate (Based on Chennai Market). Prices are updated on a daily basis using your configured daily gold and silver values.'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {error && <span className="text-brand-red text-xs font-bold uppercase">{error}</span>}
            <div className="flex items-center gap-3 bg-white/20 border border-black/5 px-6 py-3 rounded-2xl">
              <Clock size={18} className="text-brand-red" />
              <span className="text-sm text-gray-600">
                Last Updated: <span className="text-brand-text font-bold">{rates.lastUpdatedDate}, {rates.lastUpdated}</span>
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
            mode={RATE_MODE}
          />
          <RateCard
            title="Gold 22K"
            weight="1 Gram"
            rate={rates.gold22k}
            trend={rates.trends?.gold22k || 'up'}
            delay={0.2}
            mode={RATE_MODE}
          />
          <RateCard
            title="Gold 18K"
            weight="1 Gram"
            rate={rates.gold18k}
            trend={rates.trends?.gold18k || 'up'}
            delay={0.3}
            mode={RATE_MODE}
          />
          <RateCard
            title="Silver"
            weight="1 Gram"
            rate={rates.silver}
            trend={rates.trends?.silver || 'up'}
            delay={0.4}
            mode={RATE_MODE}
          />
        </div>

        <div className="mt-12 p-6 glass-premium rounded-2xl border-brand-red/20 bg-brand-red/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-brand-text font-bold">Best Value Guarantee</p>
              <p className="text-gray-600 text-sm">We offer the highest price for your gold in Coimbatore.</p>
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
