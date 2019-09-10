import { ref, Ref, isRef, watch, onBeforeUnmount } from "@vue/composition-api";

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
 * @param {function|Ref} promiseFn (optionally ref to) function that returns a Promise.
 * @param {object|Ref} params (optionally ref to) parameters passed as first argument to the promise function.
 * @returns {object} Object literal containing `isLoading`, `error` and `data` value wrappers and `abort` and `retry`
 * functions.
 */
export function useAsync(promiseFn, params = undefined) {
  // always wrap arguments
  const wrapPromiseFn = isRef(promiseFn) ? promiseFn : ref(promiseFn);
  const wrapParams = isRef(params) ? params : ref(params);

  // create empty return values
  const isLoading = ref();
  const error = ref();
  const data = ref();

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

  onBeforeUnmount(abort);

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
 * @param {string|object|Ref} requestInfo (optionally ref to) URL or request object.
 * @param {object|Ref} requestInit (optionally ref to) init parameters for the request.
 * @returns {object} Object literal containing same return values as `useAsync`.
 */
export function useFetch(requestInfo, requestInit = {}) {
  // always wrap arguments
  const wrapReqInfo = isRef(requestInfo) ? requestInfo : ref(requestInfo);
  const wrapReqInit = isRef(requestInit) ? requestInit : ref(requestInit);

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
  const wrapPromiseFn = ref(doFetch);

  // watch for change in arguments, which triggers immediately initially
  watch([wrapReqInfo, wrapReqInit], async () => {
    // create a new promise and trigger watch
    wrapPromiseFn.value = async (params, signal) => doFetch(params, signal);
  });

  return useAsync(wrapPromiseFn);
}
