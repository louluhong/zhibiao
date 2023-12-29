<template>
  <div class="app-container">
    <el-form :row="24" :model="queryParams" ref="queryForm" size="small" v-show="showSearch" label-width="68px">
      <el-col :span="6">
        <el-form-item label="名称" prop="productName">
          <el-input
            v-model="queryParams.productName"
            placeholder="请输入名称"
            clearable
            @keyup.native="handleQuery"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="年份" prop="year">
          <el-date-picker
            v-model="queryParams.year"
            type="year"
            placeholder="请选择"
            value-format="YYYY"
          />
        </el-form-item>
      </el-col>
      <!-- <el-col :span="6"> -->
        <el-form-item>
          <el-button type="primary" icon="Search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      <!-- </el-col> -->
    </el-form>

    <el-row :gutter="10" class="mb8">      
      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            icon="Upload"
            @click="handleImport"
        >导入</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="年份" align="center" prop="year" />
      <el-table-column label="名称" align="center" prop="productName" />
      <el-table-column label="指标名称" align="center" prop="targetName" />
      <el-table-column label="指标标题" align="center" prop="targetTitle" />
      <el-table-column label="权重得分" align="center" prop="weightScore" />
      <el-table-column label="指标值" align="center" prop="targetValue" />
      <el-table-column label="指标得分" align="center" prop="targetScore" />
      <!-- <el-table-column label="指标得分" align="center" prop="targetScore" /> -->
      <el-table-column label="数据来源" align="center" prop="source" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
            <div class="el-upload__tip text-center">
              <div class="el-upload__tip">
                  <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
              </div>
              <span>仅允许导入xls、xlsx格式文件。</span>
              <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
            </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
            <el-button type="primary" @click="submitFileForm">确 定</el-button>
            <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
  </el-dialog>
  </div>
</template>

<script setup name="product">
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/product/index";
import { onMounted } from 'vue';
const { proxy } = getCurrentInstance();
import { getToken } from "@/utils/auth";
// 遮罩层
const loading = ref(true)
// 选中数组
const ids = ref([]);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
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
  pageNum: 1,
  pageSize: 10,
  productName: null,
  targetId: null,
  targetName: null,
  targetTitle: null,
  parentId: null,
  ancestorId: null,
  weightScore: null,
  targetValue: null,
  targetScore: null,
  source: null,
  year: null
})
// 表单参数
const form = ref({});
// 表单校验
const rules = ref({});
/** 查询指标得分结果列表 */
const getList = () => {
  loading.value = true;
  listProduct(queryParams.value).then(response => {
    productList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
// 取消按钮
const cancel = () => {
  open.value = false;
  reset();
}
// 表单重置
const reset = () => {
  form.value = {
    id: null,
    productName: null,
    targetId: null,
    targetName: null,
    targetTitle: null,
    parentId: null,
    ancestorId: null,
    weightScore: null,
    targetValue: null,
    targetScore: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    source: null
  };
  proxy.resetForm("form");
};
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
// 多选框选中数据
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.id)
  single.value = selection.length!==1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  open.value = true;
  title.value = "添加指标得分结果";
}
/** 修改按钮操作 */
const handleUpdate = (row) => {
  reset();
  const id = row.id || ids.value
  getProduct(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改指标得分结果";
  });
}
/** 提交按钮 */
const submitForm = () => {
  proxy.$refs["form"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateProduct(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProduct(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
const handleDelete = (row) => {
  const ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除？').then(function() {
    return delProduct(ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
/** 导出按钮操作 */
const handleExport = () => {
  download('modules/product/export', {
    ...queryParams.value
  }, `product_${new Date().getTime()}.xlsx`)
}
/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/target/product/importData"
});
/** 导入按钮操作 */
function handleImport() {
  upload.title = "用户导入";
  upload.open = true;
};
/** 下载模板操作 */
function importTemplate() {
  proxy.download("system/user/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`);
};
/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
};
/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};
onMounted(()=>{
  getList();
})
</script>
