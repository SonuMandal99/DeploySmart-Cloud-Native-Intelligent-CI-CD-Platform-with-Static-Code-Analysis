const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function simulateDeployment(report) {
  if (!report || report.compilationStatus !== 'success') {
    return {
      status: 'BLOCKED',
      logs: ['Deployment blocked due to semantic errors.'],
    };
  }

  const logs = [];

  logs.push('Building Docker Image...');
  await delay(800);
  logs.push('Docker image built successfully.');
  await delay(400);

  logs.push('Pushing to Container Registry...');
  await delay(600);
  logs.push('Push completed.');
  await delay(400);

  logs.push('Deploying to Staging Environment...');
  await delay(900);
  logs.push('Deployment to staging finished.');
  await delay(500);

  logs.push('Running Health Check...');
  await delay(700);
  logs.push('Health Check Passed.');

  return {
    status: 'DEPLOYED',
    logs,
  };
}

module.exports = { simulateDeployment };
