import { resolve } from "path";
import { open } from "sqlite";
import sqlite from "sqlite3";

const DB_PATH = resolve("cache/cache.db");

let db;

export const initCache = async () => {
  db = await open({ filename: DB_PATH, driver: sqlite.Database });

  await db.exec(`
        CREATE TABLE IF NOT EXISTS cache (
            key TEXT PRIMARY KEY,
            value TEXT,
            expires INTEGER
        )
    `);
};

export const setCache = async (key, value, ttl = 60) => {
  try {
    const expires = Date.now() + ttl * 1000;

    await db.run(
      `INSERT OR REPLACE INTO cache (key, value, expires)
             VALUES (?, ?, ?)`,
      [key, JSON.stringify(value), expires],
    );
  } catch (error) {
    console.error("Cache SET error:", error.message);
  }
};

export const getCache = async (key) => {
  try {
    const row = await db.get(`SELECT value, expires FROM cache WHERE key = ?`, [key]);

    if (!row) return null;

    if (Date.now() > row.expires) {
      await db.run(`DELETE FROM cache WHERE key = ?`, [key]);
      return null;
    }

    return JSON.parse(row.value);
  } catch (error) {
    console.error("Cache GET error:", error.message);
    return null;
  }
};

export const delCache = async (key) => {
  try {
    await db.run(`DELETE FROM cache WHERE key = ?`, [key]);
  } catch (error) {
    console.error("Cache DEL error:", error.message);
  }
};

export const clearCache = async () => {
  try {
    await db.run(`DELETE FROM cache`);
  } catch (error) {
    console.error("Cache CLEAR error:", error.message);
  }
};

export const cleanExpired = async () => {
  try {
    await db.run(`DELETE FROM cache WHERE expires < ?`, [Date.now()]);
  } catch (error) {
    console.error("Cache CLEAN error:", error.message);
  }
};

export const startCacheCleaner = () => {
  setInterval(cleanExpired, 1000 * 60 * 5);
};