import request from '@/utils/request'
// 查询参数列表
export function getCityScoreList(year,typeName) {
  return request({
    url: '/target/product/getCityScoreList?year='+ year+'&typeName='+typeName,
    method: 'get',
  })
}
// 查询参数列表
export function listProduct(query) {
  return request({
    url: '/target/product/list',
    method: 'get',
    params: query
  })
}

// 查询参数详细
export function getProduct(configId) {
  return request({
    url: '/target/product/' + configId,
    method: 'get'
  })
}

// 删除
export function delProduct(configKey) {
  return request({
    url: '/target/product/' + configKey,
    method: 'delete'
  })
}

// 新增参数配置
export function addProduct(data) {
  return request({
    url: '/target/product',
    method: 'post',
    data: data
  })
}

// 修改参数配置
export function updateProduct(data) {
  return request({
    url: '/target/product',
    method: 'put',
    data: data
  })
}
