# vue-async-function

Thanks to the [Vue Function API](https://github.com/vuejs/vue-function-api) plugin you can enjoy building next
generation Vue apps today with Vue2.x. `vue-async-function` builds upon the Function API and brings you simple helpers
to handle all your asynchronous needs, in a similar fashion to the hooks functions of
[React Async](https://github.com/ghengeveld/react-async).

- Works with promises, async/await and the Fetch API
- Supports abortable fetch by providing an AbortController signal

## Installation

In your Vue 2.x project, you'll need to install `vue-function-api` together with `vue-async-function`:

```bash
npm install --save vue-function-api vue-async-function
```

Or with Yarn:

```bash
yarn add vue-function-api vue-async-function
```

Then modify your entrypoint (often `main.js` or `main.ts`), as stated in the
[Vue Function API docs](https://github.com/vuejs/vue-function-api/blob/master/README.md#usage):

```javascript
import Vue from "vue";
import { plugin } from "vue-function-api";

Vue.use(plugin);
```

After that, you can import `useAsync` and `useFetch`:

```javascript
import { useAsync, useFetch } from "vue-async-function";
```

Inside your `setup()` function you can retrieve the three reactive properties and return them to use in your template:

```javascript
  setup() {
    const { data, error, isLoading } = useAsync(someAsyncFunc);
    // ...
    return { data, error, isLoading };
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
      setTimeout(function() {
        resolve(`Done waiting ${millis} milliseconds!`);
      }, millis);
    });
  }

  export default {
    setup() {
      const { data, error, isLoading } = useAsync(wait, { millis: 2000 });
      // ...
      return { data, error, isLoading };
    }
  };
</script>
```

## `useAsync` and `fetch` example

```html
<template>
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
    if (!res.ok) throw new Error(res);
    return res.json();
  }

  export default {
    setup() {
      const { data, error, isLoading } = useAsync(loadStarship, { id: 2 });
      // ...
      return { data, error, isLoading };
    }
  };
</script>
```

## `useFetch` example

```html
<template>
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
      const { data, error, isLoading } = useFetch(url, { headers });
      // ...
      return { data, error, isLoading };
    }
  };
</script>
```

See the [vue-async-function-examples](https://github.com/AlbertBrand/vue-async-function-examples) repo for a demo
project with all examples.
