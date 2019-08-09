import { value, watch, onBeforeDestroy } from "vue-function-api";

function isWrapped(obj) {
  return obj !== undefined && obj !== null && obj._internal instanceof Object;
}

/**
 * Async helper function that returns three reactive values:
 * * `isLoading`, a boolean that is true during pending state;
 * * `data`, contains the resolved value in the fulfilled state; and
 * * `error`, contains the exception in the rejected state.
 *
 * It returns the following functions as well:
 * * `abort`, that aborts the current promise
 * * `retry`, that retries the original promise
 *
 * @param {function|ValueWrapper} promiseFn (optionally wrapped) function that returns a Promise.
 * @param {object|ValueWrapper} params (optionally wrapped) parameters passed as first argument to the promise function.
 * @returns {object} Object literal containing `isLoading`, `error` and `data` value wrappers and `abort` and `retry`
 * functions.
 */
export function useAsync(promiseFn, params) {
  // always wrap arguments
  const wrapPromiseFn = isWrapped(promiseFn) ? promiseFn : value(promiseFn);
  const wrapParams = isWrapped(params) ? params : value(params);

  // create empty return values
  const isLoading = value();
  const error = value();
  const data = value();

  // abort controller
  let controller = null;

  function abort() {
    isLoading.value = false;
    error.value = undefined;
    if (controller !== null) {
      controller.abort();
    }
  }

  function retry() {
    // unwrap the original promise as it is optionally wrapped
    const origPromiseFn = isWrapped(promiseFn) ? promiseFn.value : promiseFn;
    // create a new promise and trigger watch
    wrapPromiseFn.value = async (params, signal) =>
      origPromiseFn(params, signal);
  }

  // watch for change in arguments, which triggers immediately initially
  watch([wrapPromiseFn, wrapParams], async ([newPromiseFn, newParams]) => {
    try {
      abort();
      isLoading.value = true;
      controller = new AbortController();
      const { signal } = controller;
      const result = await newPromiseFn(newParams, signal);
      data.value = result;
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  });

  onBeforeDestroy(() => {
    abort();
  });

  return {
    isLoading,
    error,
    data,
    abort,
    retry
  };
}

/**
 * Fetch helper function that accepts the same arguments as `fetch` and returns the same values as `useAsync`.
 * If the `Accept` header is set to `application/json` in the `requestInit` object, the response will be parsed as JSON,
 * else text.
 *
 * @param {string|object|ValueWrapper} requestInfo (optionally wrapped) URL or request object.
 * @param {object|ValueWrapper} requestInit (optionally wrapped) init parameters for the request.
 * @returns {object} Object literal containing same return values as `useAsync`.
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
