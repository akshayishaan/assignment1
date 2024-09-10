type Func<T extends any[], R> = (...args: T) => Promise<R>;

const catchAsync =
  <T extends any[], R>(fn: Func<T, R>): Func<T, R> =>
  async (...args: T) => {
    try {
      return await fn(...args);
    } catch (err) {
      throw err;
    }
  };

export default catchAsync;
