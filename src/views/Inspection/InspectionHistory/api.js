import request from '@/utils/request'

// 查询产品列表
export function listManage(query) {
  return request({
    url: '/project/manage/list',
    method: 'get',
    params: {
      pageSize: 999,
      pageNum: 1,
      isDelete: 0,
      ...query,
    },
  })
}

// 查询检验记录列表
export function listOrder(query) {
  return request({
    url: '/project/order/list',
    method: 'get',
    params: {
      pageSize: 10,
      pageNum: 1,
      ...query
    }
  })
}

// 查询检验记录详细
export function getOrder(id) {
  return request({
    url: '/project/order/' + id,
    method: 'get'
  })
}

// 新增检验记录
export function addOrder(data) {
  return request({
    url: '/project/order',
    method: 'post',
    data: data
  })
}

// 修改检验记录
export function updateOrder(data) {
  return request({
    url: '/project/order',
    method: 'put',
    data: data
  })
}
