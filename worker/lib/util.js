const batchPromises = async (arrayOfArgumentsToApplyOperationOn, operation, degreeOfParallelism) => {
  let batchOfPromises = [];
  let operationResults = [];
  for (const arguments of arrayOfArgumentsToApplyOperationOn) {
    if (batchOfPromises.length >= degreeOfParallelism) {
      batchOfResults = await Promise.all(batchOfPromises);
      operationResults = [...operationResults, ...batchOfResults];
      batchOfPromises = [];
    }
    const promise = operation(...arguments);
    batchOfPromises.push(promise);
  }

  batchOfResults = await Promise.all(batchOfPromises);
  operationResults = [...operationResults, ...batchOfResults];

  return operationResults;
};

module.exports = {batchPromises};
