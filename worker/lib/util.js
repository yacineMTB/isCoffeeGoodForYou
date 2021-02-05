const batchPromises = async (arrayOfArgumentsToApplyOperationOn, operation, degreeOfParallelism) => {
  let batchOfPromises = [];
  let operationResults = [];
  for (const arguments of arrayOfArgumentsToApplyOperationOn) {
    if (batchOfPromises.length >= degreeOfParallelism) {
      batchOfResults = await Promise.all(batchOfPromises);
      operationResults = [...operationResults];
      batchOfPromises = [];
    }
    const promise = operation(...arguments);
    batchOfPromises.push(promise);
  }

  batchOfResults = await Promise.all(batchOfPromises);
  operationResults = [...operationResults];

  return operationResults;
};

module.exports = {batchPromises};
