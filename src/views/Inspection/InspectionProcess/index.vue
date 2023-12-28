<script setup name="InspectionProcess">
import { Plus, Refresh } from '@element-plus/icons-vue';

import {
  // getOrder,
  getWork,
  updateWork,
  listManage,
  listAccess,
  addAssess,
  delOrder,
} from './api';
import { actions } from './state';
import ProcessSteps from './components/ProcessSteps';

const {
  setOrderAssessId,
  showDetail,
  getData: getParameters,
} = actions;
const { proxy } = getCurrentInstance();
const { $route: { query: { id: orderId } } } = proxy;
const markings = [
  { prop: 'a', label: '优' },
  { prop: 'b', label: '良' },
  { prop: 'c', label: '中' },
  { prop: 'd', label: '差' },
  { prop: 'e', label: '太差' },
];
const typeMap = {
  0: '不合格',
  1: '合格',
};

// data
const info = reactive({
  loading: false,
  list: [
    // { key: 'name', label: '产品名称' },
    // { key: 'brand', label: '品牌' },
    // { key: 'manufacturer', label: '生产商' },
    { key: 'projectName', label: '工程名称' },
    { key: 'createBy', label: '创建人' },
    { key: 'createTime', label: '创建时间' },
    { key: 'a', label: '优' },
    { key: 'b', label: '良' },
    { key: 'c', label: '中' },
    { key: 'd', label: '差' },
    { key: 'e', label: '太差' },
  ],
  data: {},
});
const projects = reactive({
  loading: false,
  data: [],
  map: {},
});
const list = reactive({
  loading: false,
  columns: [],
  data: [],
});
const newDialog = reactive({
  loading: false,
  visible: false,
  title: '',
  form: {},
  rules: {
    projectId: [
      { required: true, message: '请选择产品', trigger: 'change' },
    ],
  },
});
const infoDialog = reactive({
  loading: false,
  visible: false,
  form: {},
});
const dialog = reactive({
  loading: false,
  visible: false,
  title: '',
  form: {},
});

// methods
const getInfo = () => {
  info.loading = true;
  // getOrder(orderId)
  getWork(orderId)
    .then((res) => {
      const { data } = res || {};
      info.data = data || {};
    })
    .catch()
    .finally(() => {
      info.loading = false;
    });
};

const handleInfoUpdate = () => {
  infoDialog.form = info.data;
  infoDialog.visible = true;
};

const handleInfoSubmit = () => {
  infoDialog.loading = true;
  updateWork(infoDialog.form)
    .then(() => {
      proxy.$modal.msgSuccess('修改成功');
      infoDialog.visible = false;
    })
    .catch(() => {
      proxy.$modal.msgError('修改失败');
    })
    .finally(() => {
      infoDialog.loading = false;
      getInfo();
      getData();
    });
};

const getProjects = () => {
  projects.loading = true;
  projects.data = [];
  projects.map = {};
  listManage()
    .then((res) => {
      const { rows } = res || {};
      (rows || []).forEach((item) => {
        const { id, name } = item || {};
        if (id) projects.map[id] = item;
        projects.data.push({ value: id, label: name });
      });
    })
    .catch()
    .finally(() => {
      projects.loading = false;
    });
};

const transformPerformances = (infoMap) => {
  const {
    performanceList,
    dataList,
    avgWeightScoreList,
    evaluateList,
    weightScoreList,
    zws,
  } = infoMap;

  const columns = [
    { prop: 'doorId', label: '序号', fixed: 'left' },
    { prop: 'projectName', label: '产品', width: '200px' },
    { prop: 'model', label: '型号' },
  ].concat((performanceList || []).map((item) => {
    const { id, name: label } = item || {};
    return { prop: String(id), label };
  }), [
    { prop: 'mgmhzpj', label: '平均值' },
    { prop: 'zws', label: '中位数' },
    { prop: 'type', label: '评价' },
  ]);

  const sumMap = {};
  const avgMap = {};
  const evaluateMap = {};
  [
    [weightScoreList, sumMap],
    [avgWeightScoreList, avgMap],
    [evaluateList, evaluateMap],
  ].forEach(([list, map], index) => {
    (list || []).forEach((item) => {
      const {
        performanceId,
        performanceName,
        totalPerformanceScore,
        evaluate,
      } = item || {};
      const value = index === 2 ? evaluate : totalPerformanceScore;
      const key = index === 2 ? performanceName : (performanceId || performanceName);
      if (key) map[key] = value;
    });
  });

  const data = Object
    .entries(dataList || {})
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([key, value]) => ({ doorId: key, ...value }));

  [
    [sumMap, '合计'],
    [avgMap, '平均'],
    [zws, '中位数'],
    [evaluateMap, '评价'],
  ].forEach(([map, doorId]) => {
    const item = { doorId };
    columns.forEach(({ prop }, index) => {
      if (index > 0) item[prop] = map[prop];
    });
    data.push(item);
  });

  return { columns, data };
};

const getData = () => {
  list.loading = true;
  listAccess({ workId: orderId })
    .then((res) => {
      const { data } = res || {};
      const formatter = transformPerformances(data || {});
      list.data = formatter.data;
      list.columns = formatter.columns;
    })
    .catch()
    .finally(() => {
      list.loading = false;
    });
};

const handleAdd = () => {
  newDialog.title = '新增',
  newDialog.form = {
    workId: orderId,
    projectId: null,
    projectName: null,
    model: null,
  };
  newDialog.visible = true;
};

const handleProjectChange = (val) => {
  const { map } = projects;
  const { name } = map[val] || {};
  newDialog.form.projectName = name || null;
};

const handleAddSubmit = () => {
  proxy.$refs.form.validate((valid) => {
    if (valid) {
      newDialog.loading = true;
      const { form } = newDialog;
      addAssess(form)
        .then((res) => {
          const { data } = res || {};
          const { id } = data || {};
          if (!id) return Promise.reject(false);
          setOrderAssessId(id);
          return getParameters();
        })
        .then((onOff) => {
          if (onOff) dialog.visible = true;
        })
        .catch()
        .finally(() => {
          newDialog.loading = false;
          newDialog.visible = false;
          getData();
        });
    }
  });
};

// const handleAdd = () => {
//   const { data: { id, projectId } } = info;
//   const { data } = list;
//   if (!id || !projectId) return;

//   list.loading = true;
//   addAssess({
//     number: data.length - 2,
//     orderId: id,
//     projectId,
//   })
//     .then((res) => {
//       const { data } = res || {};
//       const { id } = data || {};
//       if (!id) return Promise.reject(false);
//       setOrderAssessId(id);
//       return getParameters();
//     })
//     .then((onOff) => {
//       if (onOff) dialog.visible = true;
//     })
//     .catch()
//     .finally(() => {
//       getData();
//     });
// };

const handleDetail = (row) => {
  const { doorId } = row || {};
  if (!doorId) return;

  setOrderAssessId(doorId);
  getParameters()
    .then((onOff) => {
      if (onOff) {
        showDetail();
        dialog.visible = true;
      }
    })
    .catch();
};

const handleUpdate = (row) => {
  const { doorId } = row || {};
  if (!doorId) return;

  setOrderAssessId(doorId);
  getParameters()
    .then((onOff) => {
      if (onOff) dialog.visible = true;
    })
    .catch();
};

const handleDelete = (row) => {
  const { doorId } = row;
  if (!doorId) return;

  proxy.$modal.confirm(`确认要删除序号为：${doorId} 的记录吗`)
    .then(() => {
      list.loading = true;
      delOrder(doorId)
        .then(() => {
          proxy.$modal.msgSuccess('删除成功');
        })
        .catch()
        .finally(() => {
          getData();
          list.loading = false;
        });
    })
    .catch();
};

getInfo();
getProjects();
getData();

defineExpose({
  getData,
});
</script>

<template>
  <div :class="['app-container', $s.Root]">
    <el-descriptions
      v-loading="info.loading"
      :columns="3"
      border
      title="检验信息"
    >
      <template #extra>
        <el-button
          type="primary"
          text
          :disabled="!info.data.id && info.loading"
          @click="handleInfoUpdate"
        >
          修改
        </el-button>
      </template>

      <el-descriptions-item
        v-for="item in info.list"
        :key="item.key"
        :label="item.label"
      >
        {{ info.data[item.key] || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <el-row
      :gutter="10"
      class="mb8"
      style="margin-top: 20px;"
    >
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          :icon="Plus"
          size="small"
          :disabled="!info.data.id"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>

      <div class="top-right-btn">
        <el-tooltip
          class="item"
          effect="dark"
          content="刷新"
        >
          <el-button
            circle
            :icon="Refresh"
            size="small"
            @click="getData"
          />
        </el-tooltip>
      </div>
    </el-row>

    <div :class="$s.Wrap">
      <el-table
        v-loading="list.loading"
        :data="list.data"
        border
        height="100%"
      >
        <el-table-column
          v-for="column in list.columns"
          :key="column.prop"
          v-bind="column"
          align="center"
        />

        <!-- <el-table-column
          prop="mgmhzpj"
          label="平均值"
          align="center"
        />

        <el-table-column
          prop="zws"
          label="中位数"
          align="center"
        />

        <el-table-column
          prop="type"
          label="评价"
          align="center"
        /> -->

        <el-table-column
          prop="isPass"
          label="是否存在不合格指标"
          align="center"
        >
          <template #default="{ row }">
            {{ row.zt === 1 ? (typeMap[row.isPass] || '') : '' }}
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          align="right"
          fixed="right"
        >
          <template #default="{ row }">
            <template v-if="row.doorId && !['合计', '平均', '中位数', '评价'].includes(row.doorId)">
              <el-button
                type="primary"
                text
                @click="handleDetail(row)"
              >
                详情
              </el-button>

              <el-button
                v-if="row.zt === 0"
                type="primary"
                text
                @click="handleUpdate(row)"
              >
                修改
              </el-button>

              <el-button
                type="primary"
                text
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="newDialog.visible"
      :title="newDialog.title"
      width="30%"
    >
      <el-form
        ref="form"
        v-loading="newDialog.loading"
        :model="newDialog.form"
        :rules="newDialog.rules"
        label-width="80px"
      >
        <el-form-item prop="projectId" label="产品">
          <el-select-v2
            v-model="newDialog.form.projectId"
            :options="projects.data"
            filterable
            @change="handleProjectChange"
            style="width: 300px;"
          />
        </el-form-item>

        <el-form-item prop="model" label="型号">
          <el-input v-model="newDialog.form.model" placeholder="请输入型号" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="newDialog.visible = false">取消</el-button>

        <el-button
          type="primary"
          :loading="newDialog.loading"
          @click="handleAddSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="infoDialog.visible"
      title="修改"
      width="30%"
    >
      <el-form
        v-loading="infoDialog.loading"
        :model="infoDialog.form"
        label-width="80px"
      >
        <el-form-item prop="projectName" label="工程名称">
          <el-input
            v-model="infoDialog.form.projectName"
            disabled
            placeholder="请输入工程名称"
            style="width: 300px;"
          />
        </el-form-item>

        <el-form-item
          v-for="marking in markings"
          :key="marking.prop"
          v-bind="marking"
        >
          <el-input-number
            v-model="infoDialog.form[marking.prop]"
            :min="0"
            :step="1"
            style="width: 200px;"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="infoDialog.visible = false">取消</el-button>

        <el-button
          type="primary"
          :loading="infoDialog.loading"
          @click="handleInfoSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <process-steps v-model="dialog.visible" />
  </div>
</template>

<style lang="scss" module="$s">
.Root {
  box-sizing: border-box;
  height: calc(100vh - 84px);
}

.Wrap {
  height: calc(100% - 233px);
  margin-top: 20px;
  & :global {
    .el-table {
      .el-button {
        padding: 0;
      }
    }
  }
}
</style>
