<script setup name="StepTwo">
import { state, actions } from '../state';
import {
  listInspectionAssess,
  getAccess,
  addInspectionAssess,
  updateInspectionAssess,
} from '../api';

const {
  nextStep,
  backStep,
  getData,
} = actions;

const { proxy } = getCurrentInstance();

// data
const dialog = reactive({
  visible: false,
  loading: false,
  title: '',
  form: {},
  data: {
    id: null,
    orderPerformance: [],
  },
});

// computed
const disabled = computed(() => state.list.data.some((item) => (item || {}).status !== 1));

// methods
const formReset = () => {
  dialog.form = {};
  dialog.data = {
    id: null,
    orderPerformance: [],
  };
  proxy.resetForm('form');
};

const handleAdd = (row) => {
  formReset();
  dialog.loading = true;
  // const { id, parameterId: inspectionId } = row;
  const { id } = row;
  listInspectionAssess({ inspectionId: id })
    .then((res) => {
      const { data } = res || {};
      dialog.data.id = id;
      dialog.data.orderPerformance = data || [];
      (data || []).forEach((item) => {
        const { performanceId } = item || {};
        if (performanceId) dialog.form[performanceId] = 0;
      });
      dialog.visible = true;
      dialog.title = '新增';
    })
    .catch()
    .finally(() => {
      dialog.loading = false;
    });
}

const handleUpdate = (row) => {
  formReset();
  dialog.loading = true;
  const { id } = row;
  getAccess({ inspectionId: id })
    .then((res) => {
      const { rows } = res || {};
      dialog.data.id = id;
      dialog.data.orderPerformance = rows || [];
      (rows || []).forEach((item) => {
        const { performanceId, performanceScore } = item || {};
        if (performanceId) dialog.form[performanceId] = performanceScore;
      });
      dialog.visible = true;
      dialog.title = '修改';
    })
    .catch()
    .finally(() => {
      dialog.loading = false;
    });
}

const handleSubmit = () => {
  proxy.$refs.form.validate((valid) => {
    if (valid) {
      dialog.loading = true;
      const {
        form,
        title,
        data: {
          id,
          orderPerformance,
        },
      } = dialog;
      const format = orderPerformance.map((item) => {
        const { performanceId } = item;
        const { [performanceId]: performanceScore } = form;
        return {
          ...item,
          performanceScore,
        }
      });
      const api = title === '新增' ? addInspectionAssess : updateInspectionAssess;
      const payload = title === '新增'
        ? {
            id,
            orderPerformance: format,
          }
        : { orderPerformance: format };

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
</script>

<template>
  <div :class="$s.Root">
    <div :class="$s.Wrap">
      <el-table
        v-loading="state.list.loading"
        :data="state.list.data"
        border
        height="100%"
      >
        <el-table-column
          prop="parameterName"
          label="参数"
          align="center"
        />

        <el-table-column
          prop="percentPerformance"
          label="合格指标/设计值"
          align="center"
        />

        <el-table-column
          prop="inspectionResult"
          label="检测结果"
          align="center"
        />

        <el-table-column
          prop="inspectionAssess"
          label="评定"
          align="center"
        >
          <template #default="{ row }">
            <span>{{ row.inspectionAssess === 1 ? '合格' : '不合格' }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="projectQuality"
          label="产品质量"
          align="center"
        />

        <el-table-column
          prop="installationQuality"
          label="安装质量"
          align="center"
        />

        <el-table-column
          prop="status"
          label="性能指标"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.status !== null || row.status !== undefined"
              :type="row.status === 1 ? 'success' : 'primary'"
              text
              @click="row.status === 1 ? handleUpdate(row) : handleAdd(row)"
            >
              {{ row.status === 1 ? '已填报' : '未填报' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="text-align: right;">
      <el-button
        :loading="state.list.loading"
        type="primary"
        @click="backStep"
      >
        上一步
      </el-button>

      <el-button
        :loading="state.list.loading"
        type="primary"
        :disabled="disabled"
        style="margin-left: 8px;"
        @click="nextStep"
      >
        下一步
      </el-button>
    </div>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="30%"
    >
      <el-form
        ref="form"
        :model="dialog.form"
        label-width="180px"
      >
        <el-form-item
          v-for="item in dialog.data.orderPerformance"
          :key="item.id"
          :prop="String(item.performanceId)"
          :label="item.performanceName"
          :rules="{
            required: true,
            message: '请填写相应值',
            trigger: 'blur',
          }"
        >
          <el-input-number
            v-model="dialog.form[item.performanceId]"
            :min="0"
            :step="1"
            step-strictly
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
  box-sizing: border-box;
  width: 100%;
  height: calc(100% - 57px);
  padding: 20px;
}

.Wrap {
  width: 100%;
  height: calc(100% - 52px);
  margin-bottom: 20px;
}
</style>
