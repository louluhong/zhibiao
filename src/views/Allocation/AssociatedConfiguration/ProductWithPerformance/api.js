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

// 查询性能指标列表
export function listIndex(query) {
  return request({
    url: '/project/index/list',
    method: 'get',
    params: {
      pageSize: 999,
      pageNum: 1,
      isDelete: 0,
      ...query,
    },
  })
}

// 查询产品性能指标列表
export function listPerformance(query) {
  return request({
    url: '/project/performance/list',
    method: 'get',
    params: {
      pageSize: 999,
      pageNum: 1,
      isDelete: 0,
      ...query,
    },
  })
}

// 查询产品性能指标详细
export function getPerformance(id) {
  return request({
    url: '/project/performance/' + id,
    method: 'get'
  })
}

// 新增产品性能指标
export function addPerformance(data) {
  return request({
    url: '/project/performance',
    method: 'post',
    data: data
  })
}

// 修改产品性能指标
export function updatePerformance(data) {
  return request({
    url: '/project/performance',
    method: 'put',
    data: data
  })
}

// 删除产品性能指标
export function delPerformance(id) {
  return request({
    url: '/project/performance/' + id,
    method: 'delete'
  })
}
