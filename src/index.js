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
    if (controller !== null) {
      controller.abort();
    }
  }

  function retry() {
    // unwrap the original promise as it is optionally wrapped
    const origPromiseFn = wrapPromiseFn.value;
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
      const result = await newPromiseFn(newParams, controller.signal);
      error.value = undefined;
      data.value = result;
    } catch (e) {
      error.value = e;
      data.value = undefined;
    } finally {
      isLoading.value = false;
    }
  });

  onBeforeDestroy(abort);

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
  // always wrap arguments
  const wrapReqInfo = isWrapped(requestInfo) ? requestInfo : value(requestInfo);
  const wrapReqInit = isWrapped(requestInit) ? requestInit : value(requestInit);

  async function doFetch(params, signal) {
    const requestInit = wrapReqInit.value;
    const res = await fetch(wrapReqInfo.value, {
      ...requestInit,
      signal
    });
    if (!res.ok) {
      throw res;
    }
    if (
      requestInit.headers &&
      requestInit.headers.Accept === "application/json"
    ) {
      return res.json();
    }
    return res.text();
  }

  // wrap original fetch function in value
  const wrapPromiseFn = value(doFetch);

  // watch for change in arguments, which triggers immediately initially
  watch([wrapReqInfo, wrapReqInit], async () => {
    // create a new promise and trigger watch
    wrapPromiseFn.value = async (params, signal) => doFetch(params, signal);
  });

  return useAsync(wrapPromiseFn);
}
