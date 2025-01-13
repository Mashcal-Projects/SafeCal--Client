import secureLocalStorage from "react-secure-storage";


export const getFromLocalStorage = (key, defaultValue = null) => {
  let data = secureLocalStorage.getItem(key);
  if (data === undefined || data === null) {
    console.log("Item is undefined or null",defaultValue);
    return defaultValue; // Return a default value when data is not found
  }

  try {
    data = JSON.parse(data);
    return data;
  } catch (error) {
    console.error("Error parsing data from local storage:", error);
    return defaultValue; // Return default value in case of parsing errors
  }
};


export const setInLocalStorage = (key, obj) => {
  if (!obj) {
    throw new Error("item is undifined");
  }
  obj = JSON.stringify(obj);
  secureLocalStorage.setItem(key, obj);
};
export const removeFromLocalStorage = (key) => {
  try {
    secureLocalStorage.removeItem(key);
    console.log(`Item with key '${key}' has been removed from local storage.`);
  } catch (error) {
    console.error(`Error removing item with key '${key}' from local storage:`, error);
  }
};