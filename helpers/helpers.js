export const lowestPriceMapper = (arr) => {
  return arr
    .map(({ BasePrice, UnitPrice }) => BasePrice || UnitPrice)
    .sort((a, b) => {
      return a && b ? (a > b ? 1 : -1) : 0;
    });
};
