import request from '@/utils/request'

// 查询参数列表
export function listCategory(query) {
  return request({
    url: '/target/category/list',
    method: 'get',
    params: query
  })
}

// 查询参数详细
export function getCategory(configId) {
  return request({
    url: '/target/category/' + configId,
    method: 'get'
  })
}

// 根据参数键名查询参数值
export function delCategory(configKey) {
  return request({
    url: '/target/category/' + configKey,
    method: 'delete'
  })
}

// 新增参数配置
export function addCategory(data) {
  return request({
    url: '/target/category',
    method: 'post',
    data: data
  })
}

// 修改参数配置
export function updateCategory(data) {
  return request({
    url: '/target/category',
    method: 'put',
    data: data
  })
}
