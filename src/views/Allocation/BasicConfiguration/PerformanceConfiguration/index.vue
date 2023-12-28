<script setup name="PerformanceConfiguration">
// import Fuse from 'fuse.js';

import {
  listIndex,
  getIndex,
  addIndex,
  updateIndex,
  delIndex,
} from './api';

const { proxy } = getCurrentInstance();
// data
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
  listIndex()
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
    top: null,
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
  getIndex(row.id)
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
      const { id, top } = form;
      const api = id !== null ? updateIndex : addIndex;
      api({ ...form, top: top || null })
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
  proxy.$modal.confirm(`确认要删除指标：${name}吗？`)
    .then(() => {
      list.loading = true;
      delIndex(row.id)
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
        <span>性能指标配置</span>

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
        prop="top"
        label="满分"
        align="center"
      />

      <el-table-column align="right">
        <template #header>
          <el-input v-model="keywords" placeholder="指标名称/编号" />
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

        <el-form-item prop="top" label="满分">
          <el-input-number
            v-model="dialog.form.top"
            placeholder="请输入满分值"
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
