<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="数据来源" prop="source">
        <el-input
          v-model="queryParams.source"
          placeholder="请输入数据来源"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="指标名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入指标名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="指标标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入指标标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权重得分" prop="weightScore">
        <el-input
          v-model="queryParams.weightScore"
          placeholder="请输入权重得分"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="指标等级" prop="grade">
        <el-input
          v-model="queryParams.grade"
          placeholder="请输入指标等级"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="Search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
          <!-- v-hasPermi="['system:target:add']" -->
        <el-button
          type="primary"
          plain
          icon="Plus"
          size="mini"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
          <!-- v-hasPermi="['system:target:edit']" -->
        <el-button
          type="success"
          plain
          icon="Edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
          <!-- v-hasPermi="['system:target:remove']" -->
        <el-button
          type="danger"
          plain
          icon="Delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            icon="Upload"
            @click="handleImport"
        >导入</el-button>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="targetList"
      @selection-change="handleSelectionChange"
      :span-method="objectSpanMethod"
      :default-sort="{ prop: 'typeName', order: 'descending' }"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="指标类型" align="center" prop="typeName"></el-table-column>
      <el-table-column label="一级指标" align="center" prop="ancestorName" ></el-table-column>
      <el-table-column label="二级指标" sortable align="center" prop="parentName" />
      <el-table-column label="三级指标" align="center" prop="name" />
      <el-table-column label="权重" align="center" prop="weightScore" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
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
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改指标权重对话框 -->
    <el-dialog :title="title" v-model="open" width="80%" append-to-body>
      <AddDialog :row='list' ref='addDialogcom' @complete='complete' @cancel='cancel' :isEdit='isEdit'></AddDialog>      
    </el-dialog>

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
  
<script setup name="Target">
import { listTarget, getTarget,delTarget,addTarget,updateTarget} from "@/api/Indicator/target";
import { number } from "echarts";
import { nextTick } from "vue";
import AddDialog from './components/addDialog.vue'
import { getToken } from "@/utils/auth";
const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const { sys_hc_type } = proxy.useDict("sys_hc_type");
const loading = ref(true);// 遮罩层
const ids = ref([]);// 选中数组
const single = ref(true);// 非单个禁用
const multiple = ref(true);// 非多个禁用
const showSearch = ref(true);// 显示搜索条件
const total = ref(0);// 总条数
const targetList = ref([]);// 指标权重表格数据
const title = ref('');// 弹出层标题
const open = ref(false);// 是否显示弹出层
const queryParams = ref({
	pageNum: 1,
	pageSize: 10,
	type: null,
	parentId: null,
	ancestorId: null,
	categoryId: null,
	source: null,
	name: null,
	title: null,
	weightScore: null,
	grade: null,
	status: null,
});// 查询参数
const form = ref({});// 表单参数
const rules = ref({});// 表单校验


const arraySpanMethod = ({
  row,
  column,
  rowIndex,
  columnIndex,
}) => {
  if (rowIndex % 2 === 0) {
    if (columnIndex === 0) {
      return [1, 2]
    } else if (columnIndex === 1) {
      return [0, 0]
    }
  }
}

/** 查询指标权重列表 */
const getList = () => {
	loading.value = true;
	listTarget(queryParams.value).then((response) => {
		targetList.value = response.rows;
		total.value = response.total;
		loading.value = false;
	});
}
// 取消按钮
const cancel = () => {
	open.value = false;
	// reset();
}
/** 搜索按钮操作 */
const handleQuery = () =>{
	queryParams.value.pageNum = 1;
	getList();
}
/** 重置按钮操作 */
const resetQuery = () =>{
	proxy.resetForm("queryForm");
	handleQuery();
}
// 多选框选中数据
const handleSelectionChange = (selection) =>{
	ids.value = selection.map((item) => item.id);
	single.value = selection.length !== 1;
	multiple.value = !selection.length;
}
const isEdit = ref(false)
/** 新增按钮操作 */
const handleAdd = () =>{
  // router.push({
  //   name: 'AddTarget'
  // })
	// reset();
	open.value = true;
	title.value = "添加指标权重";
  isEdit.value = false;
  list.value = [{
    title: '',
    type: '',
    typeName: '',
    parentId: '',
    parentName: '',
    ancestorId: '',
    ancestorName: '',
    name: '',
    isSection: '',
    val1: '',
    val2: ''
  }]
}
/** 修改按钮操作 */
const list = ref([{
  title: '',
  type: '',
  typeName: '',
  parentId: '',
  parentName: '',
  ancestorId: '',
  ancestorName: '',
  name: '',
  isSection: '',
  val1: '',
  val2: ''
}])
const addDialogcom = ref()
const handleUpdate = (row) =>{
  row.type = row.type.toString()
  let newRow = JSON.parse(JSON.stringify(row))
  open.value = true;
  title.value = "修改指标权重";
  isEdit.value = true;
  list.value = [newRow];
  nextTick(()=>{
    console.log(row,'row===',addDialogcom.value)
    addDialogcom.value.category(row.typeName,true)
  })
  
  
  // console.log(row,'row')
  // row.val1 = row.name.split('-')
  // console.log(row.name.split('-'),"row.name.join('-')")
  
  // addDialogcom.value.category(row.typeName)
	// reset();
	// const id = row.id || ids.value;
	// getTarget(id).then((response) => {
	// 	form.value = response.data;
	// });
}
const complete = () => {
  open.value = false;
  getList()
}
/** 删除按钮操作 */
const handleDelete = (row) =>{
	const newIds = row?.id || ids.value;
	proxy.$modal
		.confirm('是否确认删除指标权重编号为"' + newIds + '"的数据项？')
		.then(function () {
			return delTarget(newIds);
		})
		.then(() => {
			getList();
			proxy.$modal.msgSuccess("删除成功");
		})
		.catch(() => {});
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
getList()
</script>
  