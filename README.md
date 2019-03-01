Note: this repository explores different ways to execute async functions in parallel (specifically when desiring such a possibility from within a [proxy](http://exploringjs.com/es6/ch_proxies.html#_tracing-property-accesses-get-set) pattern) with the purpose of use with async functions that requres the first to finish before the second starts. When that is not the case, [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) is what you want. Even when it's not possible, there are typically other ways to refactor function calls so that you can optimize for that possibility.

Imagine the following scenario:

```js
// an async function is required to retriev user information from an API call to a backend
const user = await getUser();
// the returned user has in itself an async function to get the profile of that user
const profile = await user.getProfile();

const job = await profile.job(); // thread execution stops here until this finished
await job.exec(); // thread execution stops here until this finished
const friends = await profile.getFriend(); // some unrelated execution that shouldn't have had to wait for job to have been fetched or executed
const otherJob = await friends.getOtherJobs();
await otherJob.exec();
```

Typically when you have async functions, you can use something like `Promise.all([asyncFunc1(), asyncFunc2()])`. But when the first second promise depends on the first finishing, that won't quite work.

Specifically, what is explored here are different ways to execute different chains of async functions (which originated from the same call, such as from a transparent proxy) without preventing a thread which only needed a subset of one of those chains to finish before closing the initial process.

### Three different approaches

## Using two sequential async awaits

```
node --experimental-worker async
Finished 5 second operation in asyncFunc
Finished 5 second operation in exec
Benchmark took 10012905082 nanoseconds
```

## Using two sequential async awaits, where one exsits in the context of the proxy

```
node --experimental-worker asyncProxy
Finished 5 second operation asyncFuncInProxy
Finished 5 second operation in asyncFunc
Benchmark took 10008815778 nanoseconds
```

## Creating a thread in a proxy to handle each await independently

#### In this final case, different async chains can execute in parallel without interrupting or preventing the initial process from concluding. The result is that both async threads finish at roughly the same time, allowing for proxies to spawn independent threads of async work.

```
node --experimental-worker asyncProxyThread
Finished 5 second operation in asyncFunc
Finished 5 second operation asyncFuncInProxy
Benchmark took 5108165406 nanoseconds
```
