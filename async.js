const asyncFunc = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('5 second operation finishing in asyncFunc');
      resolve();
    }, 5000);
  });
};

const exec = async time => {
  await asyncFunc();
  setTimeout(() => {
    console.log('Finished 5 second operation in exec');
    const end = process.hrtime.bigint();
    console.log(`Benchmark took ${end - time} nanoseconds`);
  }, 5000);
};
const time = process.hrtime.bigint();
(async () => exec(time))();
