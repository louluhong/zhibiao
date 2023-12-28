import request from '@/utils/request'

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

// 查询参数详细
export function getParameter(id) {
  return request({
    url: '/project/parameter/' + id,
    method: 'get'
  })
}

// 新增参数
export function addParameter(data) {
  return request({
    url: '/project/parameter',
    method: 'post',
    data: data
  })
}

// 修改参数
export function updateParameter(data) {
  return request({
    url: '/project/parameter',
    method: 'put',
    data: data
  })
}

// 删除参数
export function delParameter(id) {
  return request({
    url: '/project/parameter/' + id,
    method: 'delete'
  })
}
