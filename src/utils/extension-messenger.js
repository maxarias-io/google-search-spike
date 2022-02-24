/*
 * Typed wrapper around the web extension onMessage and sendMessage event handlers
 */

import browser from "webextension-polyfill";

export const sendMessageToBackground = async (type, data = {}) => {
  try {
    return await browser.runtime.sendMessage({ type, data });
  } catch (error) {
    return undefined;
  }
};

export const sendMessageToContentScript = async (tabId, type, data = {}) => {
  try {
    return await browser.tabs.sendMessage(tabId, { type, data });
  } catch (error) {
    return {};
  }
};

export const onMessage = (type, callback) => {
  browser.runtime.onMessage.addListener((msg, sender) => {
    if (type === msg.type) {
      return callback(msg.data, sender);
    }
    return undefined;
  });
};

export const removeMessageListener = (callback) => {
  browser.runtime.onMessage.removeListener(callback);
};
