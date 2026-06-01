import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_CURRENT_RATES = {
  gold24k: '15960',
  gold22k: '14630',
  gold18k: '11970',
  silver: '290',
  updatedAt: '2026-05-31T06:08:48.000Z',
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLED_SEED_PATH = path.resolve(__dirname, '../../data/chennai-market-rates.json');
const DEFAULT_RUNTIME_STORE_PATH = path.join(os.tmpdir(), 'sdrs-chennai-market-rates.json');
const STORE_PATH = process.env.GOLD_RATE_STORE_PATH || DEFAULT_RUNTIME_STORE_PATH;
const REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const REDIS_STORE_KEY = process.env.GOLD_RATE_STORE_KEY || 'sdrs:chennai-market-rates';

const canUseRedisStore = () => Boolean(REDIS_REST_URL && REDIS_REST_TOKEN);

const runRedisCommand = async (command) => {
  const response = await fetch(REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error(`Redis store request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.error) {
    throw new Error(payload.error);
  }

  return payload.result ?? null;
};

const ensureStoreDir = async () => {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
};

const buildInitialStore = () => ({
  current: DEFAULT_CURRENT_RATES,
  history: [
    {
      ...DEFAULT_CURRENT_RATES,
      savedAt: DEFAULT_CURRENT_RATES.updatedAt,
      source: 'seed',
    },
  ],
});

const normalizeStore = (parsed) => ({
  current: parsed?.current || DEFAULT_CURRENT_RATES,
  history: Array.isArray(parsed?.history) ? parsed.history : [],
});

const readBundledSeedStore = async () => {
  try {
    const raw = await fs.readFile(BUNDLED_SEED_PATH, 'utf8');
    return normalizeStore(JSON.parse(raw));
  } catch (error) {
    return buildInitialStore();
  }
};

const readStoreFile = async () => {
  if (canUseRedisStore()) {
    const result = await runRedisCommand(['GET', REDIS_STORE_KEY]);

    if (!result) {
      const initialStore = await readBundledSeedStore();
      await writeStoreFile(initialStore);
      return initialStore;
    }

    return normalizeStore(JSON.parse(result));
  }

  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return normalizeStore(JSON.parse(raw));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    const initialStore = await readBundledSeedStore();
    await writeStoreFile(initialStore);
    return initialStore;
  }
};

const writeStoreFile = async (store) => {
  if (canUseRedisStore()) {
    await runRedisCommand(['SET', REDIS_STORE_KEY, JSON.stringify(store)]);
    return;
  }

  await ensureStoreDir();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
};

const hasSameCurrentPayload = (left, right) =>
  left?.gold24k === right?.gold24k &&
  left?.gold22k === right?.gold22k &&
  left?.gold18k === right?.gold18k &&
  left?.silver === right?.silver &&
  left?.updatedAt === right?.updatedAt;

export const readRateStore = async () => readStoreFile();

export const getStoredRates = async () => {
  const store = await readStoreFile();
  return store.current;
};

export const saveRates = async (payload, source = 'livechennai') => {
  const store = await readStoreFile();

  if (hasSameCurrentPayload(store.current, payload)) {
    return store.current;
  }

  const dedupedHistory = store.history.filter(
    (entry) =>
      !(
        entry.updatedAt === payload.updatedAt &&
        entry.gold24k === payload.gold24k &&
        entry.gold22k === payload.gold22k &&
        entry.gold18k === payload.gold18k &&
        entry.silver === payload.silver
      )
  );

  const nextStore = {
    current: payload,
    history: [
      {
        ...payload,
        savedAt: new Date().toISOString(),
        source,
      },
      ...dedupedHistory,
    ].slice(0, 200),
  };

  await writeStoreFile(nextStore);
  return nextStore.current;
};
