export const appStore = {
  results: {} as Record<string, unknown>,
  setResult(id: string, output: unknown) {
    appStore.results = { ...appStore.results, [id]: output };
  },
};