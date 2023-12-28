<script setup name="StepOne">
import { state, actions } from '../state';

const { updateParameters } = actions;

// data
const listCache = ref([]);

// watch
watch(
  () => state.list.data,
  (val) => {
    listCache.value = val.map((item) => {
      const {
        parameterId,
        parameterName,
        percentPerformance,
        inspectionResult,
        inspectionAssess,
      } = item || {};
      return {
        parameterId,
        parameterName,
        percentPerformance: percentPerformance !== null && percentPerformance !== undefined
          ? percentPerformance
          : '',
        inspectionResult: inspectionResult !== null && inspectionResult !== undefined
          ? inspectionResult
          : '',
        inspectionAssess: inspectionAssess !== null && inspectionAssess !== undefined
          ? inspectionAssess
          : 1,
      };
    });
  },
  { deep: true, immediate: true },
);

// methods
const handleChange = (val, scope) => {
  const { $index: index, column } = scope;
  const { property } = column;
  listCache.value[index][property] = val;
};

const handleNext = () => {
  updateParameters(listCache.value);
};
</script>

<template>
  <div :class="$s.Root">
    <div :class="$s.Wrap">
      <el-table
        v-loading="state.list.loading"
        :data="listCache"
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
        >
          <template #default="scope">
            <el-input
              :model-value="scope.row.percentPerformance"
              @input="(val) => handleChange(val, scope)"
            />
          </template>
        </el-table-column>

        <el-table-column
          prop="inspectionResult"
          label="检测结果"
          align="center"
        >
          <template #default="scope">
            <el-input
              :model-value="scope.row.inspectionResult"
              @input="(val) => handleChange(val, scope)"
            />
          </template>
        </el-table-column>

        <el-table-column
          prop="inspectionAssess"
          label="评定"
          align="center"
        >
          <template #default="scope">
            <el-switch
              :model-value="scope.row.inspectionAssess"
              :active-value="1"
              :inactive-value="0"
              active-text="合格"
              inactive-text="不合格"
              @change="(val) => handleChange(val, scope)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-button
      :loading="state.list.loading"
      type="primary"
      style="display: block; margin-left: auto;"
      @click="handleNext"
    >
      下一步
    </el-button>
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
