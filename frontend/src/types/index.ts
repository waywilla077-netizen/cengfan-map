// 蹭饭点位类型 - 毕业班同学地图
export interface Spot {
  id: string
  name: string              // 姓名
  country: string           // 国家
  city: string              // 城市
  school: string            // 大学/学校
  major: string             // 专业
  canCengFan: boolean       // 是否欢迎拜访
  signatureDish: string     // 拿手菜/特色
  contact: string           // 联系方式（微信/QQ/邮箱）
  imageUrl: string          // 个人图片URL
  location: Location
  createdAt: Date
  updatedAt: Date
}

export interface Location {
  lat: number
  lng: number
}

// 表单数据
export interface SpotFormData {
  name: string
  country: string
  city: string
  school: string
  major: string
  canCengFan: boolean
  signatureDish: string
  contact: string
  imageUrl: string
}

// Socket 事件类型
export interface SocketEvents {
  'spots:update': Spot[]
  'spot:add': Spot
  'spot:remove': string
}
