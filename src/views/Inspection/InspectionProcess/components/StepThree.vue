<script setup name="StepThree">
import { state, actions } from '../state';
import { listResult } from '../api';

const {
  backStep,
  archiveDoor,
} = actions;

const typeMap = {
  0: '不合格',
  1: '合格',
};

// data
const list = reactive({
  loading: false,
  columns: [],
  data: [],
  isPass: 1,
});

// methods
const transformPerformances = (infoMap) => {
  const {
    performanceList,
    dataList,
    weightScoreList,
  } = infoMap;

  const columns = [{ prop: 'parameterName', label: '参数' }];
  const topScore = { parameterName: '满分' };
  const passScoreMap = {};
  (performanceList || []).forEach((item) => {
    const {
      performanceName,
      performanceId,
      top,
      passScore,
    } = item || {};
    if (performanceId) {
      topScore[performanceId] = top;
      passScoreMap[performanceId] = passScore;
    }
    if (performanceName === '产品质量') columns[1] = { prop: String(performanceId), label: '产品质量' };
    if (performanceName === '安装质量') columns[2] = { prop: String(performanceId), label: '安装质量' };
  });
  (performanceList || []).forEach((item) => {
    const { performanceName, performanceId } = item || {};
    if (!['产品质量', '安装质量'].includes(performanceName)) {
      columns.push({ prop: String(performanceId), label: performanceName });
    }
  });

  const data = Object
    .entries(dataList || {})
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([key, value]) => ({ parameterId: key, parameterName: state.parameters[key], ...value }));

  const score = { parameterName: '得分' };
  const pass = { parameterName: '是否合格' };
  weightScoreList.forEach((item) => {
    const { performanceId, totalPerformanceScore } = item || {};
    if (performanceId) {
      score[performanceId] = totalPerformanceScore;
      const passStatus = (totalPerformanceScore || 0) >= (passScoreMap[performanceId] || 0) ? 1 : 0;
      pass[performanceId] = passStatus;
      if (passStatus === 0) list.isPass = 0;
    }
  });
  data.push(score, topScore, pass);

  return { columns, data };
};

const getData = () => {
  list.loading = true;
  const { orderAssessId } = state;
  listResult({ orderAssessId })
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

getData();
</script>

<template>
  <div :class="$s.Root" :style="{ height: state.justLook ? '100%' : 'calc(100% - 57px)' }">
    <div
      :class="$s.Wrap"
      :style="{
        height: state.justLook ? '100%' : 'calc(100% - 52px)',
      }"
    >
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
        >
          <template #default="{ row }">
            <span v-if="row.parameterName === '是否合格' && row[column.prop] !== '是否合格'">{{ typeMap[row[column.prop]] || '' }}</span>
            <span v-else>{{ row[column.prop] !== null || row[column.prop] !== undefined ? row[column.prop] : '' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="!state.justLook" style="margin-top: 20px; text-align: right;">
      <el-button
        :loading="state.list.loading"
        type="primary"
        @click="backStep"
      >
        上一步
      </el-button>

      <el-button
        :loading="state.archiving.loading"
        type="primary"
        style="margin-left: 8px;"
        @click="archiveDoor(list.isPass)"
      >
        归档
      </el-button>
    </div>
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
}
</style>
