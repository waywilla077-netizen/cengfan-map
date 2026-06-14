// 蹭饭点位类型
export interface Spot {
  id: string
  name: string
  country: string
  city: string
  school: string
  canCengFan: boolean       // true=可蹭饭(绿色), false=不可蹭饭(灰色)
  signatureDish: string     // 拿手菜
  contact: string           // 联系方式
  location: Location
  createdAt: Date
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
  canCengFan: boolean
  signatureDish: string
  contact: string
}

// Socket 事件类型
export interface SocketEvents {
  'spots:update': Spot[]
  'spot:add': Spot
  'spot:remove': string
}
