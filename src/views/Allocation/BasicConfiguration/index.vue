<script setup name="BasicConfiguration">
import ProductConfiguration from './ProductConfiguration';
import PerformanceConfiguration from './PerformanceConfiguration';
import ParameterConfiguration from './ParameterConfiguration';

const components = [
  ProductConfiguration,
  PerformanceConfiguration,
  ParameterConfiguration,
];
</script>

<template>
  <div :class="['app-container', $s.Root]">
    <el-row :gutter="20">
      <el-col
        :span="8"
        v-for="item in components"
        :key="item.name"
      >
        <component :is="item" />
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" module="$s">
.Root {
  box-sizing: border-box;
  height: calc(100vh - 84px);
  & :global {
    .el-row {
      height: 100%;
      .el-col {
        height: 100%;
      }
      .el-card {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        height: 100%;
        &__header {
          width: 100%;
          height: 54px;
        }

        &__body {
          width: 100%;
          height: calc(100% - 54px);
        }
      }
    }
  }
}
</style>
