<script setup name="ProcessSteps">
import { state, actions } from '../state';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';

const { resetAll } = actions;

const { proxy } = getCurrentInstance();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['update:modelValue']);

// computed
const visible = computed({
  get: () => props.modelValue,
  set: (val) => {
    emits('update:modelValue', val);
  },
});

// watch
watch(
  () => state.active,
  (val) => {
    if (val === 3) {
      visible.value = false;
      proxy.$parent.getData();
    }
  },
);
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="!state.justLook ? '检验填报' : '详情'"
    fullscreen
    append-to-body
    custom-class="fullscreen-dialog"
    @closed="resetAll"
  >
    <el-steps
      v-if="!state.justLook"
      :active="state.active"
      align-center
    >
      <el-step title="参数" />
      <el-step title="性能指标" />
      <el-step title="结论" />
    </el-steps>

    <step-one v-show="state.active === 0" />

    <step-two v-show="state.active === 1" />

    <step-three v-if="state.active === 2" />
  </el-dialog>
</template>

<style lang="scss">
body {
  .fullscreen-dialog {
    .el-dialog__body {
      height: calc(100% - 54px);
    }
  }
}
</style>
