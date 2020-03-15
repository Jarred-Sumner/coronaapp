export default typeof Worker !== 'undefined'
  ? new Worker('../lib/StatsWorker.worker', {
      type: 'module',
      name: 'StatsWorker',
    })
  : null;
