import { value, onCreated, onBeforeDestroy } from "vue-function-api";

/**
 * Async helper function that returns three reactive values:
 * * `isLoading`, a boolean that is true during pending state;
 * * `data`, contains the resolved value in the fulfilled state; and
 * * `error`, contains the exception in the rejected state.
 *
 * @param {function} promiseFn A function that returns a Promise.
 * @param {object} params Parameters passed as first argument to the promise function.
 * @returns {object} Object literal containing `isLoading`, `error` and `data` value wrappers.
 */
export function useAsync(promiseFn, params) {
  let isLoading = value(true);
  let error = value(null);
  let data = value(null);
  let controller = null;

  onCreated(async () => {
    try {
      controller = new AbortController();
      const { signal } = controller;
      const result = await promiseFn(params, signal);
      data.value = result;
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  });

  onBeforeDestroy(() => {
    if (controller !== null) {
      controller.abort();
    }
  });

  return {
    isLoading,
    error,
    data
  };
}

/**
 * Fetch helper function that accepts the same arguments as `fetch` and returns the same reactive values as `useAsync`.
 * If the `Accept` header is set to `application/json` in the `requestInit` object, the response will be parsed as JSON,
 * else text.
 *
 * @param {string|object} requestInfo URL or request object.
 * @param {object} requestInit Init parameters for the request.
 * @returns {object} Object literal containing `isLoading`, `error` and `data` value wrappers.
 */
export function useFetch(requestInfo, requestInit = {}) {
  async function doFetch(params, signal) {
    const res = await fetch(requestInfo, {
      ...requestInit,
      signal
    });
    if (!res.ok) {
      throw new Error(res);
    }
    if (
      requestInit.headers &&
      requestInit.headers.Accept === "application/json"
    ) {
      return res.json();
    }
    return res.text();
  }

  return useAsync(doFetch);
}
