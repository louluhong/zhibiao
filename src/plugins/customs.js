import { customRef } from "vue";

/**
 * 防抖Ref
 * @param {any} value - 值
 * @param {number} delay - 延迟时间
 * @returns {any} - 返回值
 */
export const useDebouncedRef = (value, delay = 300) => {
  let timeout;
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      },
    };
  });
};
