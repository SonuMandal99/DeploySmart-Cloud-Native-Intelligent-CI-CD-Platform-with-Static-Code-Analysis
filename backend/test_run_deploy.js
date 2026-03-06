const { simulateDeployment } = require('./src/services/deploymentService');

async function run() {
  const reportOk = { compilationStatus: 'success' };
  console.log('Simulating successful deployment...');
  const res = await simulateDeployment(reportOk);
  console.log(res);

  const reportFail = { compilationStatus: 'failure' };
  console.log('Simulating blocked deployment...');
  const res2 = await simulateDeployment(reportFail);
  console.log(res2);
}

run();
