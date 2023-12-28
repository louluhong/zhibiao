<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字典名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入字典名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="等级" prop="grade">
        <el-select v-model="queryParams.grade" placeholder="请选择">
          <el-option
              v-for="dict in sys_grade"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="类型名称" prop="typeName">
        <el-input
          v-model="queryParams.typeName"
          placeholder="请输入类型名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-input
          v-model="queryParams.unit"
          placeholder="请输入单位"
          clearable
          @keyup.enter.native="handleQuery"
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
          type="primary"
          plain
          icon="Plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:category:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:category:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:category:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:category:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="categoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="类型名称" align="center" prop="typeName" />
      <!-- <el-table-column label="${comment}" align="center" prop="id" /> -->
      <!-- <el-table-column label="字典类型" align="center" prop="type">
        <template #default="scope">
          <span>{{sys_hc_type.filter(item=>item.value==scope.row.type)[0]?.label}}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="字典名称" align="center" prop="name" />
      <el-table-column label="等级" align="center" prop="grade" />
      <el-table-column label="单位" align="center" prop="unit" />
      <el-table-column label="是否是区间" align="center" prop="isSection">
        <template #default="scope">
          <span>{{scope.row.grade==2?(scope.row.isSection==1?'是':'否'):'/'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:category:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:category:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="类型" prop="name">
          <el-select v-model="form.type" class="m-2" placeholder="请选择" @change='typeChange'>
            <el-option
              v-for="item in sys_hc_type"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>        
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="等级" prop="grade">
          <el-select v-model="form.grade" placeholder="请选择">
            <el-option
                v-for="grade in sys_grade"
                :key="grade.value"
                :label="grade.label"
                :value="grade.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="类型名称" prop="typeName">
          <el-input v-model="form.typeName" placeholder="请输入类型名称" />
        </el-form-item> -->
        <!-- 1:区间 0：单个 -->
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="是否是区间" prop="unit" v-if='form.grade==2'>
          <el-radio-group v-model="form.isSection">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Category">
import { listCategory, getCategory, delCategory, addCategory, updateCategory } from "@/api/system/category";
const { proxy } = getCurrentInstance();
const { sys_grade,sys_hc_type } = proxy.useDict("sys_grade","sys_hc_type");
// 遮罩层
const loading = ref(true)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 【请填写功能名称】表格数据
const categoryList = ref([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  type: null,
  name: null,
  grade: null,
  typeName: null,
  unit: null
})
// 表单参数
const form = ref({})
// 表单校验
const rules = ref({})
/** 查询【请填写功能名称】列表 */
const getList = ()=>{
  loading.value = true;
  listCategory(queryParams.value).then(response => {
    categoryList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
// 取消按钮
const cancel = () =>{
  open.value = false;
  reset();
}
// 表单重置   
const reset = () =>{
  form.value = {
    id: null,
    type: null,
    name: null,
    grade: null,
    typeName: null,
    unit: null,
    isSection: null,
  };
  proxy.resetForm("categoryRef");
}
const typeChange = (val) => {
  console.log(sys_hc_type.value,'sys_hc_type')
  let item = sys_hc_type.value.filter(item=>item.value==val);
  form.value.typeName = item[0]?.label
  console.log(val,'===')
}
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
const resetQuery = () => {
  proxy.resetForm("queryForm");
  handleQuery();
}
// 多选框选中数据
const handleSelectionChange = (selection) => {
  console.log(selection.map(item => item.id),'selection')
  ids.value = selection.map(item => item.id)
  single.value = selection.length!==1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  open.value = true;
  title.value = "添加";
}
/** 修改按钮操作 */
const handleUpdate = (row) => {
  reset();
  const id = row.id || ids.value
  getCategory(id).then(response => {
    console.log(response.data,'response.data')
    response.data.type = response.data.type.toString()
    response.data.grade = response.data.grade.toString()
    form.value = response.data;
    open.value = true;
    title.value = "修改";
  });
}
/** 提交按钮 */
const submitForm = () =>{
  proxy.$refs["categoryRef"].validate(valid => {
    if (valid) {
      if(form.value.grade!=2) delete form.value.isSection
      // console.log(form.value,'+++=====')
      // return
      if (form.value.id != null) {
        updateCategory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCategory(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
const handleDelete = (row) =>{
  console.log(row.id,ids.value,'????') 
  // return
  const newIds = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除数据？').then(function() {
    return delCategory(newIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
/** 导出按钮操作 */
const handleExport = () =>{
  download('system/category/export', {
    ...queryParams.value
  }, `category_${new Date().getTime()}.xlsx`)
}
getList()
</script>
