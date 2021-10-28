export const getIteratorLength = (iterator: Iterator<any>) => {
  let length = 0;

  while (true) {
    const { done } = iterator.next();
    if (done) {
      return length;
    } else {
      length++;
    }
  }
};
