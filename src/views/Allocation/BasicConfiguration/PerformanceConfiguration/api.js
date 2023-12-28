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

// 查询性能指标详细
export function getIndex(id) {
  return request({
    url: '/project/index/' + id,
    method: 'get'
  })
}

// 新增性能指标
export function addIndex(data) {
  return request({
    url: '/project/index',
    method: 'post',
    data: data
  })
}

// 修改性能指标
export function updateIndex(data) {
  return request({
    url: '/project/index',
    method: 'put',
    data: data
  })
}

// 删除性能指标
export function delIndex(id) {
  return request({
    url: '/project/index/' + id,
    method: 'delete'
  })
}
