<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="年份" prop="year">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          placeholder="请选择"
          value-format="YYYY"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:config:export']"
        >导出</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column label="排名" type="index" width="55" align="center" />
      <el-table-column label="年份" align="center" prop="year" />
      <el-table-column label="城市" align="center" prop="city" />
      <el-table-column label="指标得分" align="center" prop="targetScore" />      
    </el-table>
    
    <!-- <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /> -->
  </div>
</template>

<script setup name="product">
import { getCityScoreList } from "@/api/product/index";
import { onMounted } from 'vue';
const { proxy } = getCurrentInstance();
import { getToken } from "@/utils/auth";
/** 导出按钮操作 */
function handleExport() {
  proxy.download("target/product/exportYear", {
    ...queryParams.value
  }, `城市指数${new Date().getTime()}.xlsx`);
}
// 遮罩层
const loading = ref(true)
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 指标得分结果表格数据
const productList = ref([]);
// 弹出层标题
const title = ref("");
// 是否显示弹出层
const open = ref(false);
// 查询参数
const queryParams = ref({
  // pageNum: 1,
  // pageSize: 10,
  city: null,
  targetScore: null,
  year: (new Date(new Date().setFullYear(new Date().getFullYear()-1)).getFullYear()).toString()
})
// 表单参数
const form = ref({});
// 表单校验
const rules = ref({});
/** 查询指标得分结果列表 */
const getList = () => {
  loading.value = true;
  getCityScoreList(queryParams.value.year).then(response => {
    productList.value = response.data;
    total.value = response.total;
    loading.value = false;
  });
}
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  console.log(queryParams.value,'queryParams.value')
  getList();
}
/** 重置按钮操作 */
const resetQuery = () => {
  proxy.resetForm("queryForm");
  handleQuery();
}
onMounted(()=>{
  getList();
})
</script>
