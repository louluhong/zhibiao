import request from '@/utils/request'

// 查询参数列表
export function listTarget(query) {
  return request({
    url: '/target/target/list',
    method: 'get',
    params: query
  })
}

// 查询参数详细
export function getTarget(configId) {
  return request({
    url: '/target/target/' + configId,
    method: 'get'
  })
}

// 根据参数键名查询参数值
export function delTarget(configKey) {
  return request({
    url: '/target/target/' + configKey,
    method: 'delete'
  })
}

// 新增参数配置
export function addTarget(data) {
  return request({
    url: '/target/target',
    method: 'post',
    data: data
  })
}

// 修改参数配置
export function updateTarget(data) {
  return request({
    url: '/target/target',
    method: 'put',
    data: data
  })
}
