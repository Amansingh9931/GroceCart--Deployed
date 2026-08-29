// src/utils/storage.js
export const getStored = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};
export const setStored = (key, val) =>
  localStorage.setItem(key, JSON.stringify(val));
export const removeStored = (key) => localStorage.removeItem(key);
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));
