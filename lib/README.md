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

Thanks to the [Vue Composition API](https://vue-composition-api-rfc.netlify.com)
[plugin](https://github.com/vuejs/composition-api) you can enjoy building next generation Vue apps today with Vue2.x.
Vue Async Function builds upon the Composition API and brings you simple helpers to handle all your asynchronous needs,
in a similar fashion to the hooks functions of [React Async](https://github.com/ghengeveld/react-async).

- Works with promises, async/await and the Fetch API
- Provides `abort` and `retry` functions
- Supports abortable fetch by providing an AbortController signal
- Reactive retry when arguments are `ref`-wrapped

## Installation

In your Vue 2.x project, you'll need to install `@vue/composition-api` together with `vue-async-function`:

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

When you call `useAsync` or `useFetch` inside your `setup()` function, you retrieve three reactive properties and return
these to use in your template. You also get two functions, `retry` and `abort` that respectively retry the original
asynchronous function or abort the current running function. Retrying a function while the original asynchronous
function is still running aborts it.

```javascript
  setup() {
    const { data, error, isLoading, retry, abort } = useAsync(someAsyncFunc);
    // ...
    return { data, error, isLoading, retry, abort };
  }
```

The second argument of `useAsync` is passed as first argument to the promise.

```javascript
  setup() {
    return useAsync(someAsyncFunc, { id: 9000 });
  }
```

If you want your application to reactively respond to changing input values for `useAsync` or `useFetch`, you can pass
in a `ref` value as well as any parameter.

```javascript
  import { ref } from "@vue/composition-api";
  // ...

  setup() {
    const wrappedAsyncFunc = ref(someAsyncFunc);
    const wrappedParams = ref({ id: 9000 });
    const { data, error, isLoading, retry, abort } = useAsync(someAsyncFunc);
    // ...
    watch(someVal, () => {
      wrappedAsyncFunc.value = async () => {}; // triggers retry
      // or
      wrappedParams.value = { id: 10000 } // triggers retry
    })
    // ...
    return { data, error, isLoading, retry, abort };
  }
```

## `useAsync` and `Promise` example

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

## `useAsync` and `fetch` example

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

## `useFetch` example

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

## `useAsync` example with wrapped values

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

## `useFetch` example with wrapped values

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

See the [examples](examples) folder for a demo project with all examples.
