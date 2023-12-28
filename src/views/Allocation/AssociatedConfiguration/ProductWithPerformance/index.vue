<script setup name="projectWithPerformance">
import {
  listManage,
  listIndex,
  listPerformance,
  getPerformance,
  addPerformance,
  updatePerformance,
  delPerformance,
} from './api';

const { proxy } = getCurrentInstance();
// data
const projects = reactive({
  loading: false,
  data: [],
  map: {},
});
const performances = reactive({
  loading: false,
  data: [],
  map: {},
});
const projectId = ref(null);
const list = reactive({
  loading: false,
  data: [],
});
const keywords = ref('');
const dialog = reactive({
  loading: false,
  visible: false,
  title: '',
  form: {},
});

// computed
const filterData = computed(() => {
  const { data } = list;

  return keywords.value
    ? data.filter(({ performanceName }) => performanceName.includes(keywords.value))
    : data;
});

const selectedPerformanceIds = computed({
  get: () => (dialog.form.data || []).map(({ performanceId }) => performanceId),
  set: (val) => {
    dialog.form.data = val.map((performanceId) => {
      const filter = dialog.form.data.find((item) => item.performanceId === performanceId);
      const { name: performanceName } = performances.map[performanceId];
      const { id, name: projectName } = projects.map[projectId.value];
      return {
        id: null,
        projectId: id,
        projectName,
        performanceId,
        performanceName,
        passScore: null,
        ...filter,
      };
    });
  },
});

// watch
watch(
  projectId,
  (val) => {
    if (val) getData();
  },
);

watch(
  () => dialog.visible,
  (val) => {
    if (val && dialog.title === '新增') getPerformances();
  },
);

// methods
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
        projects.data.push({
          value: id,
          label: name,
        });
      });
    })
    .catch()
    .finally(() => {
      projects.loading = false;
    });
};

const getPerformances = () => {
  performances.loading = true;
  performances.data = [];
  performances.map = {};
  listIndex()
    .then((res) => {
      const { rows } = res || {};

      (rows || []).forEach((item) => {
        const { id, name } = item || {};
        if (id) performances.map[id] = item;
        performances.data.push({
          value: id,
          label: name,
          disabled: list.data.some(({ performanceId }) => performanceId === id),
        });
      });
    })
    .catch()
    .finally(() => {
      performances.loading = false;
    });
};

const getData = () => {
  list.loading = true;
  listPerformance({ projectId: projectId.value })
    .then((res) => {
      const { rows } = res || {};
      list.data = rows || [];
    })
    .catch()
    .finally(() => {
      list.loading = false;
    });
};

const formReset = () => {
  dialog.form = {
    data: [],
  };
  proxy.resetForm();
};

const handleAdd = () => {
  formReset();
  const { map } = projects;
  const { name: projectName } = map[projectId.value] || {};
  dialog.form.projectId = projectId.value;
  dialog.form.projectName = projectName;
  dialog.title = '新增';
  dialog.visible = true;
};

const handleUpdate = (row) => {
  formReset();
  dialog.loading = true;
  getPerformance(row.id)
    .then((res) => {
      const { data } = res || {};
      dialog.form = { data: [data] };
      dialog.title = '修改';
      dialog.visible = true;
    })
    .catch()
    .finally(() => {
      dialog.loading = false;
    });
};

const handleSubmit = () => {
  proxy.$refs.form.validate((valid) => {
    if (valid) {
      dialog.loading = true;
      const { form, title } = dialog;
      const { data, ...rest } = form;
      const [{ id }] = data;
      const api = id !== null ? updatePerformance : addPerformance;
      const payload = id !== null
        ? data[0]
        : {
          ...rest,
          performanceList: data.map((item) => {
            const {
              performanceId,
              performanceName,
              passScore,
            } = item;

            return {
              id: performanceId,
              name: performanceName,
              passScore,
            };
          }),
        };
      api(payload)
        .then(() => {
          proxy.$modal.msgSuccess(`${title}成功`);
        })
        .catch()
        .finally(() => {
          dialog.loading = false;
          dialog.visible = false;
          getData();
        });
    }
  });
};

const handleDelete = (row) => {
  const { performanceName } = row;

  proxy.$modal.confirm(`确认要删除关联指标：${performanceName}吗？`)
    .then(() => {
      list.loading = true;
      delPerformance(row.id)
        .then(() => {
          proxy.$modal.msgSuccess('删除成功');
        })
        .catch()
        .finally(() => {
          getData();
        });
    })
    .catch();
};

const handlePerformanceDelete = (id) => {
  selectedPerformanceIds.value = selectedPerformanceIds.value.filter((performanceId) => performanceId !== id);
};

getProjects();
</script>

<template>
  <el-card>
    <template #header>
      <span>产品-性能指标关联配置</span>
    </template>

    <div :class="$s.Header">
      <el-select-v2
        v-loading="projects.loading"
        v-model="projectId"
        :options="projects.data"
        filterable
        placeholder="请选择产品"
        style="width: 300px;"
      />

      <el-button
        type="primary"
        :disabled="!projectId"
        @click="handleAdd"
      >
        新增
      </el-button>
    </div>

    <div :class="$s.Wrap">
      <el-table
        v-loading="list.loading"
        :data="filterData"
        border
        height="100%"
      >
        <el-table-column
          prop="performanceName"
          label="性能指标"
          align="center"
        />

        <el-table-column
          prop="passScore"
          label="标准值"
          align="center"
        />

        <el-table-column align="right">
          <template #header>
            <el-input v-model="keywords" placeholder="指标名称" />
          </template>

          <template #default="scope">
            <el-button
              type="primary"
              text
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>

            <el-button
              type="primary"
              text
              @click="handleUpdate(scope.row)"
            >
              修改
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        v-model="dialog.visible"
        :title="dialog.title"
        width="30%"
      >
        <el-select-v2
          v-show="dialog.title === '新增'"
          v-loading="performances.loading"
          v-model="selectedPerformanceIds"
          :options="performances.data"
          filterable
          multiple
          clearable
          collapse-tags
          placeholder="请选择性能指标"
          style="display: block;width: 300px;margin: 0 auto;"
        />


        <el-scrollbar height="300px" style="margin-top: 20px;">
          <el-form
            ref="form"
            v-loading="dialog.loading"
            :model="dialog.form"
            label-width="240px"
          >
            <el-form-item
              v-for="(item, index) in dialog.form.data"
              :key="item.performanceId"
              :prop="`data[${index}].passScore`"
              :label="`${item.performanceName || ''} 标准值`"
              :rules="{
                required: true,
                message: '标准值不能为空',
                trigger: 'blur',
              }"
            >
              <el-input-number v-model="item.passScore" style="width: 200px;" />

              <el-icon
                v-show="dialog.title === '新增'"
                :size="20"
                style="margin-left: 12px;cursor: pointer;"
                @click="handlePerformanceDelete(item.performanceId)"
              >
                <Remove />
              </el-icon>
            </el-form-item>
          </el-form>
        </el-scrollbar>

        <template #footer>
          <el-button @click="dialog.visible = false">取消</el-button>

          <el-button
            type="primary"
            :disabled="dialog.form.data.length === 0"
            :loading="dialog.loading"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </template>
      </el-dialog>
    </div>
  </el-card>
</template>

<style lang="scss" module="$s">
.Header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.Wrap {
  height: calc(100% - 52px);
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
