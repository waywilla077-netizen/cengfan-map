// 预留：中间件
import { Request, Response, NextFunction } from 'express'

export const exampleMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  next()
}
