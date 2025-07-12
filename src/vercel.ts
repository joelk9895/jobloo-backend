// src/vercel.ts
import { createNestServer } from './main';
import { Request, Response } from 'express';

let cachedApp: any = null;

export default async function handler(req: Request, res: Response) {
  if (!cachedApp) {
    const app = await createNestServer();
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp(req, res);
}
