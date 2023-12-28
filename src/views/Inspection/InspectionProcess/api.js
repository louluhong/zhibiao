import request from '@/utils/request'

// 查询检验记录详细
export function getOrder(id) {
  return request({
    url: '/project/order/' + id,
    method: 'get'
  })
}

// 查询项目详细
export function getWork(id) {
  return request({
    url: '/modules/work/' + id,
    method: 'get'
  })
}

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

// 查询项目性能评估结果列表
export function listAccess(query) {
  return request({
    url: '/order/assess/getOrderAssess',
    method: 'get',
    params: query
  })
}

export function getAccess(query) {
  return request({
    url: '/performance/assess/list',
    method: 'get',
    params: {
      pageSize: 999,
      pageNum: 1,
      isRw: 1,
      ...query
    },
  })
}

export function updateParameterInfo(data) {
  return request({
    url: '/order/inspection/addListInspection',
    method: 'post',
    data
  })
}

export function listInspectionAssess(query) {
  return request({
    url: '/performance/assess/getPerformanceList',
    method: 'get',
    params: {
      pageSize: 999,
      pageNum: 1,
      ...query
    }
  })
}

export function addInspectionAssess(data) {
  return request({
    url: '/performance/assess/addListInspection',
    method: 'post',
    data
  })
}

export function updateInspectionAssess(data) {
  return request({
    url: '/performance/assess/updateListInspection',
    method: 'post',
    data
  })
}

// // 查询项目性能评估结果列表
// export function listAccess(query) {
//   return request({
//     url: '/order/assess/list',
//     method: 'get',
//     params: {
//       pageSize: 999,
//       pageNum: 1,
//       ...query
//     }
//   })
// }

// 修改项目
export function updateWork(data) {
  return request({
    url: '/modules/work',
    method: 'put',
    data: data
  })
}

// 查询项目性能评估结果详细
export function getAssess(id) {
  return request({
    url: '/order/assess/' + id,
    method: 'get'
  })
}

// 修改项目性能评估结果
export function addAssess(data) {
  return request({
    url: '/order/assess/addPostParameter',
    method: 'post',
    data
  })
}

export function listResult(query) {
  return request({
    url: '/order/assess/getAssessList',
    method: 'get',
    params: query
  })
};

// // 新增项目性能评估结果
// export function addAssess(data) {
//   return request({
//     url: '/order/assess',
//     method: 'post',
//     data: data
//   })
// }

// // 修改项目性能评估结果
// export function updateAssess(data) {
//   return request({
//     url: '/order/assess',
//     method: 'put',
//     data: data
//   })
// }

// // 删除项目性能评估结果
// export function delAssess(id) {
//   return request({
//     url: '/order/assess/' + id,
//     method: 'delete'
//   })
// }

// 查询项目参数评估结果详细
export function listInspection(query) {
  return request({
    url: '/order/inspection/list',
    method: 'get',
    params: {
      pageSize: 999,
      pageNum: 1,
      ...query
    }
  })
}

export function doorArchived(query) {
  return request({
    url: '/order/assess/archived',
    method: 'get',
    params: query
  })
}

export function delOrder(id) {
  return request({
    url: '/project/order/' + id,
    method: 'delete'
  })
}
