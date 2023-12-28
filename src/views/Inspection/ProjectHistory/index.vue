<script setup name="ProjectHistory">
import {
  Search,
  Refresh,
  Plus,
} from '@element-plus/icons-vue';

import {
  listWork,
  getWork,
  addWork,
  updateWork,
} from './api';

const { proxy } = getCurrentInstance();
const markings = [
  { prop: 'a', label: '优' },
  { prop: 'b', label: '良' },
  { prop: 'c', label: '中' },
  { prop: 'd', label: '差' },
  { prop: 'e', label: '太差' },
];
// data
const params = reactive({
  pageSize: 10,
  pageNum: 1,
  projectName: null,
});
const showSearch = ref(true);
const list = reactive({
  loading: false,
  total: 0,
  data: [],
});
const dialog = reactive({
  loading: false,
  visible: false,
  title: '',
  form: {},
});
const rules = {
  projectId: [
    { required: true, message: '请选择项目', trigger: 'change' },
  ],
};

// methods
const getData = () => {
  list.loading = true;
  listWork(params)
    .then((res) => {
      const { total, rows } = res || {};
      list.total = total || 0;
      list.data = rows || [];
    })
    .catch()
    .finally(() => {
      list.loading = false;
    });
}

const paramsReset = () => {
  params.projectName = null;
  getData();
};

const formReset = () => {
  dialog.form = {
    id: null,
    projectName: null,
    a: 5,
    b: 4,
    c: 3,
    d: 2,
    e: 1,
  };
  proxy.resetForm();
};

const handleAdd = () => {
  formReset();
  dialog.title = '新增';
  dialog.visible = true;
};

const handleDetail = (row) => {
  const { id } = row || {};
  if (id) proxy.$router.push({ path: 'process', query: { id }});
};

const handleUpdate = (row) => {
  formReset();
  dialog.loading = true;
  getWork(row.id)
    .then((res) => {
      const { data } = res || {};
      dialog.form = data;
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
      const { id } = form;
      const api = id !== null ? updateWork : addWork;
      api(form)
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

getData();
</script>

<template>
  <div :class="['app-container', $s.Root]">
    <el-form
      ref="queryForm"
      v-show="showSearch"
      :model="params"
      inline
      label-width="68px"
    >
      <el-form-item prop="projectQuantity" label="工程名称">
        <el-input v-model="params.projectName" placeholder="请输入工程名称" />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :icon="Search"
          @click="getData"
        >
          搜索
        </el-button>

        <el-button :icon="Refresh" @click="paramsReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          :icon="Plus"
          size="small"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>

      <right-toolbar v-model:show-search="showSearch" @query-table="getData" />
    </el-row>

    <el-table
      v-loading="list.loading"
      :data="list.data"
      border
    >
      <el-table-column
        prop="projectName"
        label="产品名称"
        align="center"
      />

      <el-table-column
        prop="createBy"
        label="创建人"
        align="center"
      />

      <el-table-column
        prop="createTime"
        label="创建时间"
        align="center"
      />

      <el-table-column label="操作" align="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            text
            @click="handleDetail(row)"
          >
            详情
          </el-button>

          <el-button
            type="primary"
            text
            @click="handleUpdate(row)"
          >
            修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="list.total > 0"
      :total="list.total"
      v-model:page="params.pageNum"
      v-model:limit="params.pageSize"
      @pagination="getData"
    />

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="30%"
    >
      <el-form
        ref="form"
        v-loading="dialog.loading"
        :model="dialog.form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item prop="projectName" label="工程名称">
          <el-input
            v-model="dialog.form.projectName"
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
            v-model="dialog.form[marking.prop]"
            :min="0"
            :step="1"
            style="width: 200px;"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>

        <el-button
          type="primary"
          :loading="dialog.loading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" module="$s">
.Root {
  & :global {
    .el-table {
      .el-button {
        padding: 0;
      }
    }
  }

}
</style>
