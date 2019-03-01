function traceMethodCalls(obj) {
  const asyncFuncInProxy = async () =>
    new Promise(resolve => {
      setTimeout(() => {
        console.log('Finished 5 second operation asyncFuncInProxy');
        resolve();
      }, 5000);
    });

  const handler = {
    get(target, propKey, receiver) {
      const targetValue = target[propKey];
      return async function asyncProxy(...args) {
        await asyncFuncInProxy();
        return targetValue.apply(this, args);
      };
    },
  };
  return new Proxy(obj, handler);
}

const obj = {
  async asyncFunc(time) {
    setTimeout(() => {
      console.log('Finished 5 second operation in asyncFunc');
      const end = process.hrtime.bigint();
      console.log(`Benchmark took ${end - time} nanoseconds`);
    }, 5000);
  },
};

const tracedObj = traceMethodCalls(obj);
const time = process.hrtime.bigint();
(async () => tracedObj.asyncFunc(time))();
