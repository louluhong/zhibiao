<script setup name="PerformanceWithParameter">
import {
  listIndex,
  listParameter,
  listWeight,
  getWeight,
  addWeight,
  updateWeight,
  delWeight,
} from './api';

const { proxy } = getCurrentInstance();
// data
const performances = reactive({
  loading: false,
  data: [],
  map: {},
});
const parameters = reactive({
  loading: false,
  data: [],
  map: {},
});
const performanceId = ref(null);
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
    ? data.filter(({ parameterName }) => parameterName.includes(keywords.value))
    : data;
});

const selectedParameterIds = computed({
  get: () => (dialog.form.data || []).map(({ parameterId }) => parameterId),
  set: (val) => {
    dialog.form.data = val.map((parameterId) => {
      const filter = dialog.form.data.find((item) => item.parameterId === parameterId);
      const { name: parameterName } = parameters.map[parameterId];
      const { id, name: performanceName } = performances.map[performanceId.value];
      return {
        id: null,
        performanceId: id,
        performanceName,
        parameterId,
        parameterName,
        weighted: null,
        ...filter,
      };
    });
  },
});

// watch
watch(
  performanceId,
  (val) => {
    if (val) getData();
  },
);

watch(
  () => dialog.visible,
  (val) => {
    if (val && dialog.title === '新增') getParameters();
  },
);

// methods
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
        });
      });
    })
    .catch()
    .finally(() => {
      performances.loading = false;
    });
};

const getParameters = () => {
  parameters.loading = true;
  parameters.data = [];
  parameters.map = {};
  listParameter()
    .then((res) => {
      const { rows } = res || {};

      (rows || []).forEach((item) => {
        const { id, name } = item || {};
        if (id) parameters.map[id] = item;
        parameters.data.push({
          value: id,
          label: name,
          disabled: list.data.some(({ parameterId }) => parameterId === id),
        });
      });
    })
    .catch()
    .finally(() => {
      parameters.loading = false;
    });
};

const getData = () => {
  list.loading = true;
  listWeight({ performanceId: performanceId.value })
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
  const { map } = performances;
  const { name: performanceName } = map[performanceId.value] || {};
  dialog.form.performanceId = performanceId.value;
  dialog.form.performanceName = performanceName;
  dialog.title = '新增';
  dialog.visible = true;
};

const handleUpdate = (row) => {
  formReset();
  dialog.loading = true;
  getWeight(row.id)
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
      const api = id !== null ? updateWeight : addWeight;
      const payload = id !== null
        ? data[0]
        : {
          ...rest,
          parameterList: data.map((item) => {
            const {
              parameterId,
              parameterName,
              weighted,
            } = item;

            return {
              id: parameterId,
              name: parameterName,
              weighted,
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
  const { parameterName } = row;

  proxy.$modal.confirm(`确认要删除关联参数：${parameterName}吗？`)
    .then(() => {
      list.loading = true;
      delWeight(row.id)
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

const handleParameterDelete = (id) => {
  selectedParameterIds.value = selectedParameterIds.value.filter((performanceId) => performanceId !== id);
};

getPerformances();
</script>

<template>
  <el-card>
    <template #header>
      <span>性能指标-参数关联配置</span>
    </template>

    <div :class="$s.Header">
      <el-select-v2
        v-loading="performances.loading"
        v-model="performanceId"
        :options="performances.data"
        filterable
        placeholder="请选择性能指标"
        style="width: 300px;"
      />

      <el-button
        type="primary"
        :disabled="!performanceId"
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
          prop="parameterName"
          label="参数"
          align="center"
        />

        <el-table-column
          prop="weighted"
          label="权重（%）"
          align="center"
        />

        <el-table-column align="right">
          <template #header>
            <el-input v-model="keywords" placeholder="参数名称" />
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
          v-loading="parameters.loading"
          v-model="selectedParameterIds"
          :options="parameters.data"
          filterable
          multiple
          clearable
          collapse-tags
          placeholder="请选择参数"
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
              :key="item.parameterId"
              :prop="`data[${index}].weighted`"
              :label="`${item.parameterName || ''} 权重值（%）`"
              :rules="{
                required: true,
                message: '权重值不能为空',
                trigger: 'blur',
              }"
            >
              <el-input-number v-model="item.weighted" style="width: 200px;" />

              <el-icon
                v-show="dialog.title === '新增'"
                :size="20"
                style="margin-left: 12px;cursor: pointer;"
                @click="handleParameterDelete(item.parameterId)"
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
