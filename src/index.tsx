import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createInstance, Piral, createStandardApi } from 'piral';
import { layout, errors } from './layout';
import { createVueApi } from 'piral-vue';
import { createSvelteApi } from 'piral-svelte';
import { createSolidApi } from 'piral-solid';
import { createNgApi } from 'piral-ng';

// change to your feed URL here (either using feed.piral.cloud or your own service)
const feedUrl = 'https://feed.piral.cloud/api/v1/pilet/damondeletter-webshop';

const instance = createInstance({
  state: {
    components: layout,
    errorComponents: errors,
  },
  plugins: [createSolidApi(), createSvelteApi(), createVueApi(),...createStandardApi(),], //createNgApi(),
  requestPilets() {
    return fetch(feedUrl)
      .then((res) => res.json())
      .then((res) => res.items);
  },
});

const root = createRoot(document.querySelector('#app'));

root.render(<Piral instance={instance} />);
