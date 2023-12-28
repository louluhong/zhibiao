<script setup name="ParameterConfiguration">
// import Fuse from 'fuse.js';

import {
  listParameter,
  getParameter,
  addParameter,
  updateParameter,
  delParameter,
} from './api';

const { proxy } = getCurrentInstance();
// data
const { param_type } = proxy.useDict('param_type');
const list = reactive({
  loading: false,
  data: [],
  // fuseData: new Fuse([]),
});
const dialog = reactive({
  loading: false,
  visible: false,
  title: '',
  form: {},
});
const keywords = ref('');
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入编码', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择类别', trigger: 'change' },
  ],
};

// computed
const filterData = computed(() => {
  // const { data, fuseData } = list;
  // const filters = keywords.value
  //   ? fuseData
  //     .search(keywords.value)
  //     .map(({ item }) => item)
  //   : data;
  const { data } = list;
  const filters = keywords.value
    ? data.filter((item) => {
        const { name, code } = item;
        return name.includes(keywords.value) || String(code).includes(keywords.value);
      })
    : data;

  return filters.sort((a, b) => String(a.code || 0).charCodeAt() - String(b.code || 0).charCodeAt());
});

// methods
const getData = () => {
  list.loading = true;
  listParameter()
    .then((res) => {
      const { rows } = res || {};
      list.data = rows || [];
      // list.fuseData = new Fuse(rows, {
      //   keys: ['name', 'code'],
      //   threshold: 0.3,
      // });
    })
    .catch()
    .finally(() => {
      list.loading = false;
    });
};

const formReset = () => {
  dialog.form = {
    id: null,
    name: null,
    code: null,
    type: null,
  };
  proxy.resetForm('form');
};

const handleAdd = () => {
  formReset();
  dialog.title = '新增';
  dialog.visible = true;
};

const handleUpdate = (row) => {
  formReset();
  dialog.loading = true;
  getParameter(row.id)
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
      const api = id !== null ? updateParameter : addParameter;
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

const handleDelete = (row) => {
  const { name } = row;
  proxy.$modal.confirm(`确认要删除参数：${name}吗？`)
    .then(() => {
      list.loading = true;
      delParameter(row.id)
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

getData();
</script>

<template>
  <el-card :class="$s.Card">
    <template #header>
      <div :class="$s.CardHeader">
        <span>参数配置</span>

        <el-button
          type="primary"
          text
          @click="handleAdd"
        >
          新增
        </el-button>
      </div>
    </template>

    <el-table
      v-loading="list.loading"
      :data="filterData"
      border
      height="100%"
    >
      <el-table-column
        prop="name"
        label="名称"
        align="center"
      />

      <el-table-column
        prop="code"
        label="编码"
        align="center"
      />

      <el-table-column
        prop="type"
        label="检测类别"
        align="center"
      >
        <template #default="{ row }">
          <dict-tag :options="param_type" :value="row.type" />
        </template>
      </el-table-column>

      <el-table-column align="right">
        <template #header>
          <el-input v-model="keywords" placeholder="参数名称/编号" />
        </template>

        <template #default="{ row }">
          <el-button
            type="primary"
            text
            @click="handleDelete(row)"
          >
            删除
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
        <el-form-item prop="name" label="名称">
          <el-input v-model="dialog.form.name" placeholder="请输入名称" />
        </el-form-item>

        <el-form-item prop="code" label="编码">
          <el-input
            v-model="dialog.form.code"
            placeholder="请输入编码"
          />
        </el-form-item>

        <el-form-item prop="type" label="检测类别">
          <el-select v-model="dialog.form.type" placeholder="请选择检测类别">
            <el-option
              v-for="option in param_type"
              :key="option.value"
              :value="Number(option.value)"
              :label="option.label"
            />
          </el-select>
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
  </el-card>
</template>

<style lang="scss" module="$s">
.Card {
  &Header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  & :global {
    .el-table {
      .el-button {
        padding: 0;
      }
    }
  }
}
</style>
