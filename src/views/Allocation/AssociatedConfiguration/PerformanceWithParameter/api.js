import request from '@/utils/request'

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

// 查询参数列表
export function listParameter(query) {
  return request({
    url: '/project/parameter/list',
    method: 'get',
    params: {
      pageSize: 999,
      pageNum: 1,
      isDelete: 0,
      ...query,
    },
  })
}

// 查询关联及权重列表
export function listWeight(query) {
  return request({
    url: '/project/weight/list',
    method: 'get',
    params: {
      pageSize: 999,
      pageNum: 1,
      isDelete: 0,
      ...query,
    },
  })
}

// 查询关联及权重详细
export function getWeight(id) {
  return request({
    url: '/project/weight/' + id,
    method: 'get'
  })
}

// 新增关联及权重
export function addWeight(data) {
  return request({
    url: '/project/weight',
    method: 'post',
    data: data
  })
}

// 修改关联及权重
export function updateWeight(data) {
  return request({
    url: '/project/weight',
    method: 'put',
    data: data
  })
}

// 删除关联及权重
export function delWeight(id) {
  return request({
    url: '/project/weight/' + id,
    method: 'delete'
  })
}
