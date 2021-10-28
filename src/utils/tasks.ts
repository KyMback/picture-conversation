export const task = <TResult>(operation: () => TResult) => {
  return new Promise<TResult>((res, rej) => {
    setTimeout(() => {
      try {
        const result = operation();
        res(result);
      } catch (e) {
        rej(e);
      }
    });
  });
};
