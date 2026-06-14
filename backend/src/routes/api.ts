import { Router, Request, Response } from 'express'
import { SpotModel } from '../models/Spot.js'

const router = Router()

// 获取所有点位
router.get('/spots', async (_req: Request, res: Response) => {
  try {
    const spots = await SpotModel.find()
      .sort({ createdAt: -1 })
      .lean()

    const formattedSpots = spots.map((spot) => ({
      ...spot,
      id: spot._id.toString(),
    }))

    res.json({
      success: true,
      data: formattedSpots,
      total: formattedSpots.length,
    })
  } catch (error) {
    console.error('获取点位失败:', error)
    res.status(500).json({ success: false, error: '获取点位失败' })
  }
})

// 获取单个点位
router.get('/spots/:id', async (req: Request, res: Response) => {
  try {
    const spot = await SpotModel.findById(req.params.id).lean()

    if (!spot) {
      res.status(404).json({ success: false, error: '点位不存在' })
      return
    }

    res.json({
      success: true,
      data: { ...spot, id: spot._id.toString() },
    })
  } catch (error) {
    console.error('获取点位失败:', error)
    res.status(500).json({ success: false, error: '获取点位失败' })
  }
})

// 创建点位
router.post('/spots', async (req: Request, res: Response) => {
  try {
    const spot = new SpotModel(req.body)
    const savedSpot = await spot.save()

    res.status(201).json({
      success: true,
      data: { ...savedSpot.toObject(), id: savedSpot._id.toString() },
    })
  } catch (error) {
    console.error('创建点位失败:', error)
    res.status(500).json({ success: false, error: '创建点位失败' })
  }
})

// 更新点位
router.put('/spots/:id', async (req: Request, res: Response) => {
  try {
    const spot = await SpotModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean()

    if (!spot) {
      res.status(404).json({ success: false, error: '点位不存在' })
      return
    }

    res.json({
      success: true,
      data: { ...spot, id: spot._id.toString() },
    })
  } catch (error) {
    console.error('更新点位失败:', error)
    res.status(500).json({ success: false, error: '更新点位失败' })
  }
})

// 删除点位
router.delete('/spots/:id', async (req: Request, res: Response) => {
  try {
    const spot = await SpotModel.findByIdAndDelete(req.params.id)

    if (!spot) {
      res.status(404).json({ success: false, error: '点位不存在' })
      return
    }

    res.json({ success: true })
  } catch (error) {
    console.error('删除点位失败:', error)
    res.status(500).json({ success: false, error: '删除点位失败' })
  }
})

// 统计：可蹭饭/不可蹭饭数量
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [canCengFan, cannotCengFan] = await Promise.all([
      SpotModel.countDocuments({ canCengFan: true }),
      SpotModel.countDocuments({ canCengFan: false }),
    ])

    res.json({
      success: true,
      data: {
        canCengFan,
        cannotCengFan,
        total: canCengFan + cannotCengFan,
      },
    })
  } catch (error) {
    console.error('获取统计失败:', error)
    res.status(500).json({ success: false, error: '获取统计失败' })
  }
})

export default router
