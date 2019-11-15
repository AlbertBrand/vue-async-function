import { useAsync } from "../src";
import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";

// setup vue
import Vue from "vue";
import VueCompositionApi, { ref } from "@vue/composition-api";
Vue.use(VueCompositionApi);

// component helper
function createComponentWithUseAsync(promiseFn, params) {
  return {
    setup() {
      return useAsync(promiseFn, params);
    },
    render: h => h()
  };
}

describe("useAsync", () => {
  it("returns initial values", () => {
    const promiseFn = async () => {};
    const Component = createComponentWithUseAsync(promiseFn);

    const wrapper = shallowMount(Component);

    expect(wrapper.vm.isLoading).toBe(true);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBeUndefined();
    expect(wrapper.vm.retry).toBeDefined();
    expect(wrapper.vm.abort).toBeDefined();
  });

  it("updates reactive values when promise resolves", async () => {
    const promiseFn = () => Promise.resolve("done");
    const Component = createComponentWithUseAsync(promiseFn);

    const wrapper = shallowMount(Component);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe("done");
  });

  it("updates reactive values when promise rejects", async () => {
    const promiseFn = () => Promise.reject("error");
    const Component = createComponentWithUseAsync(promiseFn);

    const wrapper = shallowMount(Component);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBe("error");
    expect(wrapper.vm.data).toBeUndefined();
  });

  it("retries original promise when retry is called", async () => {
    let fail = true;
    const promiseFn = jest.fn(() =>
      fail ? Promise.reject("error") : Promise.resolve("done")
    );
    const Component = createComponentWithUseAsync(promiseFn);
    const wrapper = shallowMount(Component);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBe("error");
    expect(wrapper.vm.data).toBeUndefined();
    expect(promiseFn).toBeCalledTimes(1);

    fail = false;
    wrapper.vm.retry();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isLoading).toBe(true);
    expect(wrapper.vm.error).toBe("error");
    expect(wrapper.vm.data).toBeUndefined();
    expect(promiseFn).toBeCalledTimes(2);

    await flushPromises();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe("done");
  });

  it("sends abort signal to promise when abort is called", () => {
    let aborted = false;
    const promiseFn = async (params, signal) => {
      signal.addEventListener("abort", () => {
        aborted = true;
      });
    };
    const Component = createComponentWithUseAsync(promiseFn);
    const wrapper = shallowMount(Component);
    expect(wrapper.vm.isLoading).toBe(true);

    wrapper.vm.abort();

    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBeUndefined();
    expect(aborted).toBe(true);
  });

  it("aborts promise when component is destroyed", async () => {
    let aborted = false;
    const promiseFn = async (params, signal) => {
      signal.addEventListener("abort", () => {
        aborted = true;
      });
    };
    const Component = createComponentWithUseAsync(promiseFn);
    const wrapper = shallowMount(Component);

    wrapper.destroy();

    expect(aborted).toBe(true);
  });

  it("calls promiseFn with provided params argument", () => {
    const promiseFn = jest.fn(async () => {});
    const params = {};
    const Component = createComponentWithUseAsync(promiseFn, params);

    shallowMount(Component);

    expect(promiseFn).toBeCalledWith(params, expect.any(Object));
  });

  it("accepts value wrapped arguments", async () => {
    const promiseFn = ref(async ({ msg }) => msg);
    const params = ref({ msg: "done" });
    const Component = createComponentWithUseAsync(promiseFn, params);

    const wrapper = shallowMount(Component);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe("done");
  });

  it("retries original promise when value wrapped promiseFn is changed", async () => {
    const promiseFn = async () => "done";
    const wrapPromiseFn = ref(promiseFn);
    const Component = createComponentWithUseAsync(wrapPromiseFn);
    const wrapper = shallowMount(Component);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe("done");

    let resolvePromise = () => {};
    const newPromiseFn = () =>
      new Promise(resolve => {
        resolvePromise = () => resolve("done again");
      });

    wrapPromiseFn.value = newPromiseFn;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isLoading).toBe(true);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe("done");

    resolvePromise();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe("done again");
  });

  it("retries original promise within wrapped value when retry is called", async () => {
    const promiseFn = jest.fn(async () => "done");
    const wrapPromiseFn = jest.fn(promiseFn);
    const Component = createComponentWithUseAsync(wrapPromiseFn);
    const wrapper = shallowMount(Component);
    expect(promiseFn).toBeCalledTimes(1);

    wrapper.vm.retry();
    await wrapper.vm.$nextTick();

    expect(promiseFn).toBeCalledTimes(2);
  });

  it("resets error state when resolve directly follows reject", async () => {
    let failReject, successResolve;
    const failPromiseFn = () =>
      new Promise((resolve, reject) => {
        failReject = () => reject("error");
      });
    const successPromiseFn = () =>
      new Promise(resolve => {
        successResolve = () => resolve("success");
      });
    const wrapPromiseFn = ref(failPromiseFn);
    const Component = createComponentWithUseAsync(wrapPromiseFn);

    const wrapper = shallowMount(Component);
    wrapPromiseFn.value = successPromiseFn;
    await wrapper.vm.$nextTick();
    failReject();
    successResolve();

    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe("success");
  });

  it("sets mutually exclusive data or error", async () => {
    const promiseFn = () => Promise.resolve("done");
    const wrapPromiseFn = ref(promiseFn);
    const Component = createComponentWithUseAsync(wrapPromiseFn);

    const wrapper = shallowMount(Component);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe("done");

    wrapPromiseFn.value = () => Promise.reject("error");
    await flushPromises();

    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBe("error");
    expect(wrapper.vm.data).toBeUndefined();

    wrapPromiseFn.value = () => Promise.resolve("done");
    await flushPromises();

    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe("done");
  });
});
