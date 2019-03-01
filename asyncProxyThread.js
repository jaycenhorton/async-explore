function traceMethodCalls(obj) {
  const handler = {
    get(target, propKey, receiver) {
      const targetValue = target[propKey];
      return async function asyncProxy(...args) {
        (async () => {
          const { job, start, stop } = require('microjob');
          try {
            // start the worker pool
            await start();
            // this function will be executed in another thread
            const resolvedJob = await job(
              async data =>
                new Promise(resolve => {
                  setTimeout(() => {
                    console.log('Finished 5 second operation asyncFuncInProxy');
                    const end = process.hrtime.bigint();
                    resolve(`Benchmark took ${end - data.time} nanoseconds`);
                  }, 5000);
                }),
              { data: { time: args[0] } }
            );
            console.log(resolvedJob);
          } catch (err) {
            console.error(err);
          } finally {
            // shutdown worker pool
            await stop();
          }
        })();

        return targetValue.apply(this, args);
      };
    },
  };
  return new Proxy(obj, handler);
}
const obj = {
  async asyncFunc(time) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Finished 5 second operation in asyncFunc');
        resolve();
      }, 5000);
    });
  },
};

const tracedObj = traceMethodCalls(obj);
const time = process.hrtime.bigint();
(async () => tracedObj.asyncFunc(time))();
