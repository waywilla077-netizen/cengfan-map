// 预留：控制器
import { Request, Response } from 'express'

export const exampleController = {
  get: (_req: Request, res: Response) => {
    res.json({ message: '预留控制器' })
  },
}
