<template>
  <div class="addDialog">
		<el-form ref="formRef" :model="form" :rules="rules" label-width="70px" :inline="true">
			<div v-for='listItem,index in list' :key='index'>
				<el-form-item label="标题">
					<el-select v-model="listItem.type" class="m-2" placeholder="请选择" @change='typeChange($event,index)'>
						<el-option
							v-for="item in sys_hc_type"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="一级指标">
					<el-select v-model="listItem.ancestorId" class="m-2" placeholder="请选择" @change='ancestorChange($event,index)'>
						<el-option
							v-for="item in oneTarget"
							:key="item.id"
							:label="item.name"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="二级指标">
					<el-select v-model="listItem.parentId" class="m-2" placeholder="请选择" @change='parentIdChange($event,index)'>
						<el-option
							v-for="item in twoTarget"
							:key="item.id"
							:label="item.name"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="三级指标">
					<div style="display: flex;">
						<el-input v-model="listItem.val1" placeholder="请输入" style="margin-right:5px;width:50%;"  @change='valChange1($event,index)'/> <span v-if='listItem.isSection==1'>—</span> 
						<el-input style="margin-left:5px;width:50%;" v-model="listItem.val2" placeholder="请输入"  @change='valChange2($event,index)' v-if='listItem.isSection==1'/>
					</div>
				</el-form-item>
				<el-form-item label="权重">
					<div>
						<el-input-number v-model="listItem.weightScore" :min="1" :max="10" />
						<!-- <el-input v-model="listItem.weightScore" placeholder="请输入"/> -->
					</div>
				</el-form-item>
				<el-icon style="font-size:25px;cursor: pointer;" @click="addClick" v-if='!isEdit'><CirclePlus /></el-icon>
			</div>
		</el-form>		
		<div slot="footer" class="dialog-footer">
			<el-button type="primary" @click="submitForm">确 定</el-button>
			<el-button @click="cancel">取 消</el-button>
		</div>
	</div>
</template>
<script setup>
	import { listCategory } from "@/api/system/category";
	import { addTarget,updateTarget} from "@/api/Indicator/target";
	const { proxy } = getCurrentInstance();
	const { sys_hc_type } = proxy.useDict("sys_hc_type");
	const emit = defineEmits(['cancel', 'complete'])

	const props = defineProps({
		row: {
			type: Array,
			default: ()=>[]
		},
		isEdit: {
			type: Boolean
		}
	})
	const form = ref({})
	const list = computed(() => {
		return props.row
	})
	// 一级指标，二级指标
	const oneTarget = ref([]);
	const twoTarget = ref([])
	const typeName = ref()
	const category = (typeName,isEdit) => {
		listCategory({
			pageNum: 1,
			pageSize: 9999,
			typeName: typeName
		}).then(res=>{
			oneTarget.value = res.rows.filter(item=>item.grade==1);
			twoTarget.value = res.rows.filter(item=>item.grade==2);
			if(isEdit){
				let isSection = twoTarget.value.filter(item=>item.id==props.row[0].parentId)
				list.value[0].isSection = isSection[0]?.isSection;
				if(isSection[0].isSection == 1) {
					list.value[0].val1 = props.row[0].name.split('-')[0]
					list.value[0].val2 = props.row[0].name.split('-')[1]
				}else{
					list.value[0].val1 = props.row[0].name
				}
				
			}
		})
	}
	
	const addClick = () => {
		list.value.push({
			title: '',
			type: '',
			typeName: '',
			parentId: '',
			parentName: '',
			ancestorId: '',
			ancestorName: '',
			name: '',
		})
	}
	// 标题
	const typeChange = (val,index) => {
		let item = sys_hc_type.value.filter(item=>item.value==val);
  	typeName.value = item[0]?.label;
		list.value[index].typeName = typeName.value;
		category(typeName.value)
	}
	// 一级指标
	const ancestorChange = (val,index) => {
		let item = oneTarget.value.filter(item=>item.id==val);
  	list.value[index].ancestorName = item[0]?.name;
	}
	// 二级指标
	const parentIdChange = (val,index) => {
		let item = twoTarget.value.filter(item=>item.id==val);
		console.log(item,'item===')
  	list.value[index].parentName = item[0]?.name;
		list.value[index].isSection = item[0]?.isSection;
	}
	// 三级指标
	const valChange1 = (val,index) => {
	}
	const valChange2 = (val,index) => {
	}
	/** 提交按钮 */
	const submitForm = () =>{
		list.value.forEach(item => {
			if(item.isSection==1){
				item.title = `${item.val1}-${item.val2}`
				item.name = `${item.val1}-${item.val2}`
			}
			if(item.isSection==0){
				item.title = `${item.val1}`
				item.name = `${item.val1}`
			}
		});
		if(props.isEdit){
			updateTarget(list.value[0]).then(res=>{
				console.log(res,'res====')
				proxy.$modal.msgSuccess("新增成功");
				reset()
				emit('complete')
				emit('cancel')
			})
		}else{
			addTarget(list.value).then(res=>{
				console.log(res,'res====')
				proxy.$modal.msgSuccess("新增成功");
				reset()
				emit('complete')
				emit('cancel')
			})
		}
	}
	const cancel = () => {
		emit('cancel')
		reset()
	}
	const reset = () =>{
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
	defineExpose({
		reset,
		category
	})
</script>
<style lang='scss'>	
	.addDialog{
		.el-form-item__label{
			font-weight: 700 !important;
		}
		.el-form-item__content{
			width: 165px !important;
		}
	}
	
</style>
<style scoped lang="scss">
	.el-form--inline .el-form-item{
		margin-right: 5px;
	}
	.btn{
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 1px solid #ddd;
		color: #999;
		line-height: 20px;
		text-align: center;
		cursor: pointer;
		margin-left: 10px;
	}
</style>
