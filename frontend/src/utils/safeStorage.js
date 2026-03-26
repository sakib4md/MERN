// safeStorage: tiny wrapper around localStorage with try/catch
const isLocalStorageAvailable = () => {
  try {
    const key = "__test__";
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    return false;
  }
};

export const getItem = (key) => {
  try {
    if (!isLocalStorageAvailable()) return null;
    return window.localStorage.getItem(key);
  } catch (err) {
    console.error("safeStorage.getItem failed", err);
    return null;
  }
};

export const setItem = (key, value) => {
  try {
    if (!isLocalStorageAvailable()) return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.error("safeStorage.setItem failed", err);
    return false;
  }
};

export const removeItem = (key) => {
  try {
    if (!isLocalStorageAvailable()) return false;
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error("safeStorage.removeItem failed", err);
    return false;
  }
};

export const getToken = () => getItem("token");
export const setToken = (t) => (t ? setItem("token", t) : removeItem("token"));

export default { getItem, setItem, removeItem, getToken, setToken };
