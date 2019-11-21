<p align="center">
  <a href="https://github.com/AlbertBrand/vue-async-function"><img src="./img/vue-async-function.png" width="469" alt="Vue Async Function" /></a>
</p>
<br/>

<p align="center">
  <a href="https://www.npmjs.com/package/vue-async-function">
    <img src="https://img.shields.io/npm/v/vue-async-function.svg" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/vue-async-function">
    <img src="https://img.shields.io/npm/dm/vue-async-function.svg" alt="npm downloads">
  </a>
  <a href="https://bundlephobia.com/result?p=vue-async-function">
    <img src="https://img.shields.io/bundlephobia/min/vue-async-function.svg" alt="minified size">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/npm/l/vue-async-function.svg" alt="license">
  </a>
  <a href="https://github.com/AlbertBrand/vue-async-function/issues">
    <img src="https://img.shields.io/github/issues/AlbertBrand/vue-async-function.svg" alt="issues">
  </a>
  <a href="https://github.com/AlbertBrand/vue-async-function/pulls">
    <img src="https://img.shields.io/github/issues-pr/AlbertBrand/vue-async-function.svg" alt="pull requests">
  </a>
</p>

Vue Async Function delivers a compositional API for promise resolution and data fetching. It is inspired by the hooks
functions of [React Async](https://github.com/ghengeveld/react-async) and builds upon the
[Vue Composition API](https://vue-composition-api-rfc.netlify.com) that is coming with Vue 3.0. Luckily, thanks to
[the official plugin](https://github.com/vuejs/composition-api) you can build Vue apps with the new Composition API
today with Vue 2.5+.

- Works with promises, async/await and the Fetch API
- Provides `abort` and `retry` functions
- Supports abortable fetch by providing an AbortController signal
- Reactive retry when arguments are `ref`-wrapped
- Written in TypeScript, ships with type definitions

## Installation

The current version expects your project to be built with [vue-cli 4.0+](https://cli.vuejs.org). There's no support for
previous verions. If your project is still built with 3.x, consider upgrading it. There's a detailed
[upgrading guide](https://cli.vuejs.org/migrating-from-v3) available.

In your Vue project, you need to install `@vue/composition-api` together with `vue-async-function`:

```bash
npm install --save @vue/composition-api vue-async-function
```

Or with Yarn:

```bash
yarn add @vue/composition-api vue-async-function
```

Then modify your entrypoint (often `main.js` or `main.ts`), as stated in the
[Vue Composition API docs](https://github.com/vuejs/composition-api#installation):

```javascript
import Vue from "vue";
import VueCompositionApi from "@vue/composition-api";

Vue.use(VueCompositionApi);
```

After that, you can import `useAsync` or `useFetch`:

```javascript
import { useAsync, useFetch } from "vue-async-function";
```

## useAsync usage

Inside your `setup()` function you can call `useAsync` and provide it a function that returns a Promise as its first
argument. `useAsync` returns three ref-wrapped properties: `isLoading`, `error` and `data`. These are reactively updated
to match the state of the asynchronous process while resolution takes place. You also get two functions, `retry` and
`abort` that respectively retry the original asynchronous function or abort the current running function.

You can choose to return any of these values to use them in the component template or pass them to other functions to
'compose' your component. A simple example:

```javascript
export default {
  setup() {
    const { data, error, isLoading, retry, abort } = useAsync(someAsyncFunc);
    // ...
    return { data, error, isLoading, retry, abort };
  }
};
```

The second argument of `useAsync` is optional. If provided, it is passed as first argument to the Promise returning
function.

```javascript
export default {
  setup() {
    return useAsync(someAsyncFunc, { id: 9000 });
  }
};
```

### AbortController

`useAsync` calls the asynchronous function for you with the optional first argument. Its second argument is an instance
of an [AbortController signal](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal). Your function
should listen to the 'abort' event on the signal and cancel its behavior when triggered.

In the following example, the `wait` function simply waits for a configurable period and then resolves to a string. If
the `abort` function returned from the `useAsync` call is triggered, the timeout is cleared and the promise won't
resolve. It is up to you to decide if the promise needs to be rejected as well.

```javascript
async function wait({ millis }, signal) {
  return new Promise(resolve => {
    const timeout = setTimeout(
      () => resolve(`Done waiting ${millis} milliseconds!`),
      millis
    );
    signal.addEventListener("abort", () => clearTimeout(timeout));
  });
}

export default {
  setup() {
    return useAsync(wait, { millis: 10000 });
  }
};
```

Note: calling `retry` while the asynchronous function is not resolved calls `abort` as well.

### Reactive arguments

If you want your application to reactively respond to changing input values for `useAsync`, you can pass in a
`ref`-wrapped value as well as any parameter.

An example:

```javascript
import { ref } from "@vue/composition-api";
// ...

export default {
  setup() {
    const wrappedAsyncFunc = ref(someAsyncFunc);
    const wrappedParams = ref({ id: 9000 });
    const { data, error, isLoading, retry, abort } = useAsync(someAsyncFunc);
    // ...
    watch(someVal, () => {
      wrappedAsyncFunc.value = someOtherAsyncFunc; // triggers retry
      // or
      wrappedParams.value = { id: 10000 }; // triggers retry
    });
    // ...
    return { data, error, isLoading, retry, abort };
  }
};
```

Note that the triggered retry is the same as when you call `retry` explicitly, so it will also call `abort` for
unresolved functions.

## useFetch usage

With `useAsync` you could wrap the Fetch API easily. An example:

```javascript
async function loadStarship({ id }, signal) {
  const headers = { Accept: "application/json" };
  const res = await fetch(`https://swapi.co/api/starships/${id}/`, {
    headers,
    signal
  });
  if (!res.ok) throw res;
  return res.json();
}

export default {
  setup() {
    return useAsync(loadStarship, { id: 2 });
  }
};
```

This is such a common pattern that there is a special function for it: `useFetch`. We can implement above example as
follows:

```javascript
import { useFetch } from "vue-async-function";

export default {
  setup() {
    const id = 9;
    const url = `https://swapi.co/api/starships/${id}/`;
    const headers = { Accept: "application/json" };
    return useFetch(url, { headers });
  }
};
```

`useFetch` accepts the same arguments as the browser Fetch API. It will hook up the `AbortController` signal for you and
based on the `Accept` header it will choose between returning `text()` or `json()` results.

### Reactive arguments

Above example shines even more with reactive arguments:

```javascript
import { useFetch } from "vue-async-function";
import { ref, computed } from "@vue/composition-api";

export default {
  setup() {
    const id = ref(2);
    const computedUrl = computed(
      () => `https://swapi.co/api/starships/${id.value}/`
    );
    const headers = { Accept: "application/json" };
    return {
      id,
      ...useFetch(computedUrl, { headers })
    };
  }
};
```

Here, the `id` is made reactive. The `url` is also reactive, using the `computed` function that recomputes whenever any
of the reactive values is changed. We return both the `id` and all of the results of `useFetch`. Now we can for instance
bind the reactive `id` with `v-model` to an input field. Whenever the input field changes, it will cause the fetch to be
retried, aborting the current fetch if unresolved.

## Full examples

### `useAsync` and `Promise` example

```html
<template>
  <div id="root">
    <h2>useAsync and promises</h2>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error!</div>
    <pre v-else>{{ data }}</pre>
  </div>
</template>

<script>
  import { useAsync } from "vue-async-function";

  async function wait({ millis }) {
    return new Promise(resolve => {
      setTimeout(() => resolve(`Done waiting ${millis} milliseconds!`), millis);
    });
  }

  export default {
    setup() {
      return useAsync(wait, { millis: 2000 });
    }
  };
</script>
```

### `useAsync` and `fetch` example

```html
<template>
  <button @click="retry" :disabled="isLoading">Retry</button>
  <button @click="abort" :disabled="!isLoading">Abort</button>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error!</div>
  <pre v-else>{{ data }}</pre>
</template>

<script>
  import { useAsync } from "vue-async-function";

  async function loadStarship({ id }, signal) {
    const headers = { Accept: "application/json" };
    const res = await fetch(`https://swapi.co/api/starships/${id}/`, {
      headers,
      signal
    });
    if (!res.ok) throw res;
    return res.json();
  }

  export default {
    setup() {
      return useAsync(loadStarship, { id: 2 });
    }
  };
</script>
```

### `useFetch` example

```html
<template>
  <button @click="retry" :disabled="isLoading">Retry</button>
  <button @click="abort" :disabled="!isLoading">Abort</button>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error!</div>
  <pre v-else>{{ data }}</pre>
</template>

<script>
  import { useFetch } from "vue-async-function";

  export default {
    setup() {
      const id = 9;
      const url = `https://swapi.co/api/starships/${id}/`;
      const headers = { Accept: "application/json" };
      return useFetch(url, { headers });
    }
  };
</script>
```

### `useAsync` example with wrapped values

```html
<template>
  <div id="root">
    <h2>useAsync and promises, with value</h2>
    <button @click="retry">Retry</button>
    <button @click="abort">Abort</button>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error!</div>
    <pre v-else>{{ data }}</pre>
  </div>
</template>

<script>
  import { useAsync } from "vue-async-function";
  import { ref, watch } from "@vue/composition-api";

  async function wait({ millis }, signal) {
    return new Promise(resolve => {
      const timeout = setTimeout(
        () => resolve(`Done waiting ${millis} milliseconds!`),
        millis
      );
      signal.addEventListener("abort", () => clearTimeout(timeout));
    });
  }

  export default {
    setup(props) {
      const wrapParams = ref();
      // watch incoming props change
      watch(
        () => props.ms,
        millis => {
          wrapParams.value = { millis };
        }
      );
      return useAsync(wait, wrapParams);
    },
    props: {
      ms: { type: Number, required: true }
    }
  };
</script>
```

### `useFetch` example with wrapped values

```html
<template>
  <div id="root">
    <h2>useFetch with value</h2>
    <label>
      Ship ID:
      <input v-model="id" type="number" />
    </label>
    <button @click="retry">Retry</button>
    <button @click="abort">Abort</button>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error!</div>
    <pre v-else>{{ data }}</pre>
  </div>
</template>

<script>
  import { useFetch } from "vue-async-function";
  import { ref, computed } from "@vue/composition-api";

  export default {
    setup() {
      const id = ref(2);
      const computedUrl = computed(
        () => `https://swapi.co/api/starships/${id.value}/`
      );
      const headers = { Accept: "application/json" };
      return {
        id,
        ...useFetch(computedUrl, { headers })
      };
    }
  };
</script>
```

See the [examples](../examples) folder for a demo project with all examples in JavaScript.
See the [examples-ts](../examples-ts) folder for a demo project with all examples in TypeScript.
