import { useFetch } from "../src";
import { shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";

// setup vue
import Vue from "vue";
import VueCompositionApi, { ref } from "@vue/composition-api";
Vue.use(VueCompositionApi);

// component helper
function createComponentWithUseFetch(requestInfo, requestInit) {
  return {
    setup() {
      return useFetch(requestInfo, requestInit);
    },
    render: h => h()
  };
}

describe("useFetch", () => {
  const jsonResult = { success: true };
  const textResult = "success";
  const response = {
    ok: true,
    json: jest.fn(async () => jsonResult),
    text: jest.fn(async () => textResult)
  };
  const mockFetch = jest.fn(async () => response);

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
  });

  it("calls fetch with requestInfo and requestInit arguments including signal, returns values", async () => {
    const requestInfo = "http://some-url.local";
    const requestInit = { headers: { Accept: "application/json" } };
    const Component = createComponentWithUseFetch(requestInfo, requestInit);

    const wrapper = shallowMount(Component);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isLoading).toBe(true);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBeUndefined();
    expect(wrapper.vm.retry).toBeDefined();
    expect(wrapper.vm.abort).toBeDefined();
    expect(fetch).toBeCalledWith(
      requestInfo,
      expect.objectContaining(requestInit)
    );
    expect(fetch.mock.calls[0][1].signal).toBeDefined();

    await flushPromises();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe(jsonResult);
  });

  it("resolves to text response when no json header is set", async () => {
    const Component = createComponentWithUseFetch("");

    const wrapper = shallowMount(Component);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isLoading).toBe(true);

    await flushPromises();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe(textResult);
  });

  it("rejects with bad response when response is not ok", async () => {
    const Component = createComponentWithUseFetch("");
    const failedResponse = {
      ok: false
    };
    mockFetch.mockResolvedValueOnce(failedResponse);

    const wrapper = shallowMount(Component);
    expect(wrapper.vm.isLoading).toBe(true);

    await flushPromises();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toEqual(failedResponse);
    expect(wrapper.vm.data).toBeUndefined();
  });

  it("accepts value wrapped arguments", async () => {
    const requestInfo = "http://some-url.local";
    const requestInit = { headers: { Accept: "application/json" } };
    const Component = createComponentWithUseFetch(
      ref(requestInfo),
      ref(requestInit)
    );

    const wrapper = shallowMount(Component);
    await wrapper.vm.$nextTick();

    expect(fetch).toBeCalledWith(
      requestInfo,
      expect.objectContaining(requestInit)
    );
  });

  it("retries original promise when requestInfo argument changes", async () => {
    const requestInfo = "http://some-url.local";
    const wrapRequestInfo = ref(requestInfo);
    const Component = createComponentWithUseFetch(wrapRequestInfo);
    const wrapper = shallowMount(Component);
    await flushPromises();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe(textResult);
    expect(fetch).toBeCalledWith(requestInfo, expect.anything());

    const newTextResult = "success 2";
    response.text.mockResolvedValueOnce(newTextResult);
    const newRequestInfo = "http://some-other-url.local";
    wrapRequestInfo.value = newRequestInfo;
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isLoading).toBe(true);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe(textResult);
    expect(fetch).toBeCalledWith(newRequestInfo, expect.anything());

    await flushPromises();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe(newTextResult);
  });

  it("retries original promise when requestInit argument changes", async () => {
    const requestInfo = "http://some-url.local";
    const requestInit = { headers: { Accept: "application/json" } };
    const wrapRequestInit = ref(requestInit);
    const Component = createComponentWithUseFetch(requestInfo, wrapRequestInit);
    const wrapper = shallowMount(Component);
    await flushPromises();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe(jsonResult);

    const newRequestInit = { headers: { Accept: "text/plain" } };
    wrapRequestInit.value = newRequestInit;
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isLoading).toBe(true);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe(jsonResult);
    expect(fetch).toBeCalledWith(
      requestInfo,
      expect.objectContaining(requestInit)
    );

    await flushPromises();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.error).toBeUndefined();
    expect(wrapper.vm.data).toBe(textResult);
    expect(fetch).toBeCalledWith(requestInfo, expect.anything());
  });
});
