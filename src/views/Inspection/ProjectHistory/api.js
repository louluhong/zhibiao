import request from '@/utils/request'

// 查询项目列表
export function listWork(query) {
  return request({
    url: '/modules/work/list',
    method: 'get',
    params: {
      pageSize: 999,
      pageNum: 1,
      ...query
    }
  })
}

// 查询项目详细
export function getWork(id) {
  return request({
    url: '/modules/work/' + id,
    method: 'get'
  })
}

// 新增项目
export function addWork(data) {
  return request({
    url: '/modules/work',
    method: 'post',
    data: data
  })
}

// 修改项目
export function updateWork(data) {
  return request({
    url: '/modules/work',
    method: 'put',
    data: data
  })
}

// 删除项目
export function delWork(id) {
  return request({
    url: '/modules/work/' + id,
    method: 'delete'
  })
}
