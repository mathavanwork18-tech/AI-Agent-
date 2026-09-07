import serverless from 'serverless-http';
import app from '../../backend/dist/server.js';

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  return await serverlessHandler(event, context);
};

export default handler;
