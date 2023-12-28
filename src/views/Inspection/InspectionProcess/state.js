import { reactive } from "vue";

import {
  listInspection,
  updateParameterInfo,
  doorArchived,
} from './api';

export const state = reactive({
  orderAssessId: null,
  list: {
    loading: false,
    data: [],
  },
  active: 0,
  parameters: {},
  justLook: false,
  archiving: {
    loading: false,
  },
});

const setOrderAssessId = (id) => {
  state.orderAssessId = id;
};

const showDetail = () => {
  state.justLook = true;
  state.active = 2;
};

const getData = () => {
  state.list.loading = true;
  const { orderAssessId } = state;

  return listInspection({ orderAssessId })
    .then((res) => {
      const { rows } = res || {};
      state.list.data = (rows || [])
        .sort((a, b) => Number(a.parameterId || 0) - Number(b.parameterId || 0))
        .sort((a, b) => Number(a.status || 0) - Number(b.status || 0));
      (rows || []).forEach((item) => {
        const { parameterId, parameterName } = item;
        if (parameterId) state.parameters[parameterId] = parameterName;
      });
      return true;
    })
    .catch()
    .finally(() => {
      state.list.loading = false;
    });
};

const updateParameters = (listCache) => {
  const { orderAssessId, list: { data } } = state;
  const orderInspection = data.map((item, index) => {
    const { [index]: filter } = listCache;
    return { ...item, ...filter };
  });

  state.list.loading = true;
  updateParameterInfo({ id: orderAssessId, orderInspection })
    .then(() => {
      nextStep();
    })
    .catch()
    .finally(() => {
      getData();
    });
};

const nextStep = () => {
  state.active += 1;
};

const backStep = () => {
  state.active -= 1;
};

const resetStep = () => {
  state.active = 0;
};

const resetData = () => {
  state.list.data = [];
};

const resetAll = () => {
  setOrderAssessId(null);
  resetStep();
  resetData();
  state.justLook = false;
};

const archiveDoor = (isPass) => {
  const { orderAssessId } = state;
  state.archiving.loading = true;
  doorArchived({ orderAssessId, isPass })
    .then()
    .catch()
    .finally(() => {
      state.archiving.loading = false;
      nextStep();
    });
};

export const actions = {
  setOrderAssessId,
  showDetail,
  getData,
  updateParameters,
  nextStep,
  backStep,
  resetStep,
  resetData,
  resetAll,
  archiveDoor,
};
