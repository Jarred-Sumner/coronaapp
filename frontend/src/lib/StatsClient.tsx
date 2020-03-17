import {unstable_batchedUpdates} from 'react-dom';
let worker;
import {debounce} from 'lodash';

if (typeof Worker !== 'undefined') {
  worker = new Worker('../lib/StatsWorker.worker', {
    type: 'module',
    name: 'StatsWorker',
  });
}

const listeners = new Set<Function>();
let hasListener = false;
const _listener = event => {
  unstable_batchedUpdates(() => {
    listeners.forEach(listener => {
      listener && listener(event);
    });
  });
};

const debouncedMessage = (...args) => worker.postMessage(...args);

export default typeof Worker !== 'undefined'
  ? ({
      addEventListener: (type, listener) => {
        if (!hasListener) {
          worker.addEventListener(type, _listener);
          hasListener = true;
        }

        listeners.add(listener);
      },
      postMessage: debouncedMessage,
      removeEventListener: (type, listener) => {
        if (listeners.has(listener)) {
          listeners.delete(listener);
        }

        if (listeners.size === 0 && hasListener) {
          worker.removeEventListener(type, _listener);
          hasListener = false;
        }
      },
    } as Worker)
  : null;
