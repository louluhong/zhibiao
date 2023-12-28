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

// 查询产品详细
export function getManage(id) {
  return request({
    url: '/project/manage/' + id,
    method: 'get'
  })
}

// 新增产品
export function addManage(data) {
  return request({
    url: '/project/manage',
    method: 'post',
    data: data
  })
}

// 修改产品
export function updateManage(data) {
  return request({
    url: '/project/manage',
    method: 'put',
    data: data
  })
}

// 删除产品
export function delManage(id) {
  return request({
    url: '/project/manage/' + id,
    method: 'delete'
  })
}
