<template>
  <!-- 用户管理页面容器 -->
  <div class="user-manager">
    <!-- ==================== 搜索表单区域 ==================== -->
    <el-form :inline="true" ref="userRuleFormRef" :model="userRuleForm" label-width="auto" class="mt-5 mb-10">
      <!-- 用户ID输入 -->
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model.trim="userRuleForm.userId" placeholder="请输入用户ID" />
      </el-form-item>

      <!-- 用户名称输入 -->
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model.trim="userRuleForm.userName" placeholder="请输入用户名称" />
      </el-form-item>

      <!-- 用户状态下拉选择 -->
      <el-form-item label="用户状态" prop="state">
        <el-select v-model.trim="userRuleForm.state" placeholder="请输入用户状态">
          <el-option :label="item.label" :value="item.value" v-for="(item, i) in stateOptions" :key="i" />
        </el-select>
      </el-form-item>

      <!-- 搜索和重置按 -->
      <el-form-item>
        <el-button type="primary" @click="userSubmitForm(userRuleFormRef)">
          查询
        </el-button>
        <el-button @click="resetForm(userRuleFormRef)">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- ==================== 控制按钮区域 ==================== -->
    <div class="control-button mt-4 mb-8">
      <el-button type="primary" @click="handleAddClick">新增</el-button>
      <el-button type="success" @click="handleBatchDeleteClick">批量删除</el-button>
      <el-button type="danger" @click="handleExportClick">导出数据</el-button>
    </div>

    <!-- ==================== 用户表格区域 ==================== -->
    <div class="user-table">
      <el-table ref="tableRef" :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <!-- 多选列 -->
        <el-table-column type="selection" width="55" :selectable="selectable" />

        <!-- 动态渲染数据列 -->
        <el-table-column :label="item.label" :prop="item.property" v-for="(item, t) in columns" :key="t"
          :formatter="item.formatter" />

        <!-- 操作 -->
        <el-table-column align="center" label="操作">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- ==================== 分页组件 ==================== -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          <span class="total-text">共{{ total }} 条记录</span>
          <span class="page-text">第{{ currentPage4 }} / {{ Math.ceil(total / pageSize4) || 1 }} 页</span>
        </div>
        <el-pagination v-model:current-page="currentPage4" v-model:page-size="pageSize4" :page-sizes="[5, 10, 20]"
          :size="size" :disabled="disabled" :background="background" layout="sizes, prev, pager, next, jumper"
          :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <!-- ==================== 对话框组 ==================== -->
      <el-dialog v-model="customDraggingVisible" :title="dialogTitle" width="500" align-center>
        <!-- 新增/编辑用户表单 -->
        <div v-if="active === 'add' || active === 'edit'">
          <el-form ref="DialogRuleFormRef" style="max-width: 600px" :model="DialogRuleForm" :rules="DialogRules"
            label-width="80px">
            <!-- 用户 -->
            <el-form-item label="用户" prop="userName">
              <el-input v-model="DialogRuleForm.userName" placeholder="请输入用户名称" />
            </el-form-item>
            <!-- 邮箱 -->
            <el-form-item label="邮箱" prop="userEmail">
              <el-input v-model="DialogRuleForm.userEmail" placeholder="请输入邮箱">
                <template #append>.com</template>
              </el-input>
            </el-form-item>
            <!-- 手机 -->
            <el-form-item label="手机" prop="mobile">
              <el-input v-model="DialogRuleForm.mobile" placeholder="请输入手机号" />
            </el-form-item>
            <!-- 岗位 -->
            <el-form-item label="岗位" prop="job">
              <el-input v-model="DialogRuleForm.job" placeholder="请输入岗位名称" />
            </el-form-item>
            <!-- 状 -->
            <el-form-item label="状" prop="state">
              <el-select v-model="DialogRuleForm.state" placeholder="请选择状态">
                <el-option v-for="item in stateOptions2" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- 系统角色 -->
            <el-form-item label="系统角色" prop="role">
              <el-select v-model="DialogRuleForm.role" multiple placeholder="请选择角色">
                <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- 部门 -->
            <el-form-item label="部门" prop="dept">
              <el-cascader v-model="DialogRuleForm.dept" :options="deptCascaderOptions" :props="{ checkStrictly: true }"
                placeholder="请选择部门" clearable />
            </el-form-item>
          </el-form>
        </div>

        <!-- 批量删除确认 -->
        <span v-else-if="active === 'batchDelete'">确定批量删除选中用户吗？</span>

        <!-- 导出数据确认 -->
        <span v-else-if="active === 'export'">确定导出用户数据吗？</span>

        <!-- 对话框底部按 -->
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="handleDialogCancel">取消</el-button>
            <el-button type="primary" @click="handleDialogSubmit">
              确认
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * UserAd.vue - 用户管理页面
 * 
 * 功能说明：
 * 1. 用户列表展示（支持分页）
 * 2. 用户搜索筛选（按ID、名称、状态）
 * 3. 批量操作（新增、删除、导出）
 * 4. 单行操作（编辑、删除）
 */




// ==================== 导入依赖 ====================
import { reactive, ref, onMounted, computed } from 'vue'
import Api from './../api'
import type { FormInstance, ComponentSize } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

// ==================== 分页相关状 ====================

/** 当前页码 */
const currentPage4 = ref(1)
/** 每页显示条数 */
const pageSize4 = ref(10)
/** 分页组件尺寸 */
const size = ref<ComponentSize>('default')
/** 是否显示背景 */
const background = ref(true)
/** 是否禁用分页 */
const disabled = ref(false)
/** 总条 */
const total = ref(0)

/**
 * 每页条数改变事件
 * @param val 新的每页条数
 */
const handleSizeChange = (val: number) => {
  pageSize4.value = val
  currentPage4.value = 1
  sliceTableData()
}

/**
 * 当前页码改变事件
 * @param val 新的页码
 */
const handleCurrentChange = (val: number) => {
  currentPage4.value = val
  sliceTableData()
}

// ==================== 搜索表单相关 ====================

/** 用户状态下拉选项 */
const stateOptions = [
  { label: '所有', value: 0 },
  { label: '在职', value: 1 },
  { label: '离职', value: 2 },
  { label: '试用期', value: 3 },
]

/**
 * 控制哪些行可以被选中
 * @param row 当前行数
 * @returns 是否可选中
 */
const selectable = (row: any) => ![1, 31].includes(row.userId)

/** 表单引用 */
const userRuleFormRef = ref<FormInstance>()

/** 搜索表单数据 */
const userRuleForm = reactive<userRuleForm>({
  userId: '',
  userName: '',
  state: 1,
})

/**
 * 提交搜索表单
 * @param formEl 表单实例
 */
const userSubmitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      currentPage4.value = 1 // 搜索时重置到第一
      getuserlist()
    }
  })
}

/**
 * 重置搜索表单
 * @param formEl 表单实例
 */
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  currentPage4.value = 1 // 重置时回到第一
  getuserlist()
}

// ==================== 表格数据相关 ====================




/** 表格数据（当前页显示的数据） */
const tableData = ref<User[]>([])

/** 所有用户数据（用于前端分页） */
const allTableData = ref<User[]>([])

/**
 * 根据分页参数切片数据
 */
const sliceTableData = () => {
  const start = (currentPage4.value - 1) * pageSize4.value
  const end = start + pageSize4.value
  tableData.value = allTableData.value.slice(start, end)
}

/**
 * 编辑用户
 * @param _index 行索
 * @param row 行数
 */
const handleEdit = (_index: number, row: any) => {
  active.value = 'edit'
  // 保存当前编辑用户的userId
  currentEditUserId.value = row.userId || ''
  // 填充表单数据
  DialogRuleForm.userName = row.userName || ''
  DialogRuleForm.userEmail = row.userEmail || ''
  DialogRuleForm.mobile = row.mobile || ''
  DialogRuleForm.job = row.job || ''
  DialogRuleForm.state = row.state || 3
  DialogRuleForm.role = row.roleList || []
  DialogRuleForm.dept = row.deptId || []
  customDraggingVisible.value = true
}

/**
 * 删除用户
 * @param _index 行索
 * @param row 行数
 */
const handleDelete = (_index: number, row: any) => {
  ElMessageBox.confirm(
    '确定要删除该用户吗？',
    '提示',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      customClass: 'centered-message-box',
    }
  )
    .then(() => {
      Api.deleteUser({ userId: row.userId })
        .then((res: any) => {
          ElMessage.success(res.msg || '删除成功')
          getuserlist()
        })
        .catch((err: any) => {
          ElMessage.error(err?.msg || err?.message || '删除失败')
        })
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

/** 表格列配 */
const columns = [
  {
    label: '用户ID',
    property: 'userId',
  },
  {
    label: '用户名称',
    property: 'userName',
  },
  {
    label: '用户邮箱',
    property: 'userEmail',
  },
  {
    label: '用户角色',
    property: 'role',
    // @ts-ignore
    formatter: (row: any, column: any, cellValue: number) => {
      const obj: any = {
        0: '管理员',
        1: '普通用户',
      }
      return obj[cellValue] || cellValue
    }
  },
  {
    label: '用户状态',
    property: 'state',
    // @ts-ignore
    formatter: (row: any, column: any, cellValue: number) => {
      const obj: any = {
        0: '所有',
        1: '在职',
        2: '离职',
        3: '试用期',
      }
      return obj[cellValue] || cellValue
    }
  },
  {
    label: '用户注册时间',
    property: 'createTime',
  },
  {
    label: '用户最后登录时间',
    property: 'lastLoginTime',
  },
]

/**
 * 获取用户列表数据
 */
const getuserlist = async () => {
  const params = {
    ...userRuleForm,
  }
  Api.getUserList(params).then((res: any) => {
    // 保存所有数
    allTableData.value = res.list || res.data?.list || []
    // 更新总条
    total.value = allTableData.value.length
    // 根据当前分页切片显示
    sliceTableData()
  }).catch((err: any) => {
    ElMessage.error(err?.msg || err?.message || '获取用户列表失败')
  })
}

/**
 * 获取角色列表数据
 */
const getroleList = async () => {
  Api.getRoleList().then((res: any) => {
    // API 可能直接返回数组或包含list/data 的对
    const roleList = Array.isArray(res) ? res : res.list || res.data || []
    roleOptions.value = roleList.map((item: any) => ({
      value: item._id || item.roleId,
      label: item.roleName,
    }))
  })
}

/**
 * 获取部门列表数据
 */
const getdeptList = async () => {
  Api.getDeptList().then((res: any) => {
    // API 直接返回数组
    const deptList = Array.isArray(res) ? res : res.data || []
    deptCascaderOptions.value = deptList.map((item: any) => ({
      value: item._id,
      label: item.deptName,
      children: item.children?.map((child: any) => ({
        value: child._id,
        label: child.deptName,
        children: child.children?.map((grandChild: any) => ({
          value: grandChild._id,
          label: grandChild.deptName,
        })) || [],
      })) || [],
    }))
  })
}

// ==================== 对话框相 ====================

/** 选中的行数据 */
const selectedRows = ref<any[]>([])

/** 对话框显示状 */
const customDraggingVisible = ref(false)

/** 当前操作类型 */
const active = ref('')

/** 当前编辑用户的userId */
const currentEditUserId = ref('')

/** 对话框标 */
const dialogTitle = computed(() => {
  const titles: any = {
    'add': '用户新增',
    'edit': '用户编辑',
    'batchDelete': '批量删除',
    'export': '导出数据'
  }
  return titles[active.value] || '提示'
})

/** 新增表单引用 */
// @ts-ignore
const DialogRuleFormRef = ref<FormInstance>()

/** 新增表单数据 */
const DialogRuleForm = reactive<RuleForm>({
  userName: '',
  userEmail: '',
  mobile: '',
  job: '',
  state: 3,
  role: [],
  dept: [],
})

/** 状态下拉选项 */
const stateOptions2 = [
  { label: '在职', value: 1 },
  { label: '离职', value: 2 },
  { label: '试用期', value: 3 },
]

/** 角色下拉选项 */
const roleOptions = ref<{ value: number; label: string }[]>([])

/** 部门级联选项 */
const deptCascaderOptions = ref<{ value: string; label: string; children?: { value: string; label: string; children?: { value: string; label: string }[] }[] }[]>([])

/** 新增表单验证规则 */
const DialogRules = reactive<any>({
  userName: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度应为 2 到 20 个字符', trigger: 'blur' },
  ],
  userEmail: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  mobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  state: [
    { required: true, message: '请选择状态', trigger: 'change' },
  ],
  role: [
    { required: true, message: '请选择系统角色', trigger: 'change', type: 'array' },
  ],
  dept: [
    { required: true, message: '请选择部门', trigger: 'change', type: 'array' },
  ],
})

/**
 * 点击新增按钮
 */
const handleAddClick = () => {
  customDraggingVisible.value = true
  active.value = 'add'
}

/**
 * 处理表格选中行变
 * @param selection 选中的行数据
 */
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

/**
 * 点击批量删除按钮
 */
const handleBatchDeleteClick = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }
  customDraggingVisible.value = true
  active.value = 'batchDelete'
}

/**
 * 点击导出数据按钮
 */
/**
 * 导出数据为Excel
 */
const handleExportClick = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }

  // 定义导出
  const exportColumns = [
    { label: '用户ID', prop: 'userId' },
    { label: '用户名称', prop: 'userName' },
    { label: '用户邮箱', prop: 'userEmail' },
    { label: '手机', prop: 'mobile' },
    { label: '岗位', prop: 'job' },
    { label: '用户角色', prop: 'role', formatter: (val: number) => ({ 0: '管理员', 1: '普通用户' }[val] || val) },
    { label: '用户状态', prop: 'state', formatter: (val: number) => ({ 0: '所有', 1: '在职', 2: '离职', 3: '试用期' }[val] || val) },
    { label: '注册时间', prop: 'createTime' },
    { label: '最后登录时间', prop: 'lastLoginTime' },
  ]

  // 构建CSV内容
  const headers = exportColumns.map(col => col.label).join(',')
  const rows = tableData.value.map(row => {
    return exportColumns.map(col => {
      let val = row[col.prop as keyof User]
      if (col.formatter && val !== undefined) {
        val = col.formatter(val as number) as any
      }
      // 处理包含逗号的
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`
      }
      return val || ''
    }).join(',')
  }).join('\n')

  const csvContent = `\ufeff${headers}\n${rows}`

  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = `用户数据_${new Date().toLocaleDateString()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('导出成功')
}

/**
 * 重置新增/编辑表单
 */
const resetDialogForm = () => {
  DialogRuleForm.userName = ''
  DialogRuleForm.userEmail = ''
  DialogRuleForm.mobile = ''
  DialogRuleForm.job = ''
  DialogRuleForm.state = 3
  DialogRuleForm.role = []
  DialogRuleForm.dept = []
}

/**
 * 对话框取消处
 */
const handleDialogCancel = () => {
  customDraggingVisible.value = false
  resetDialogForm()
}

/**
 * 对话框提交处
 */
/**
 * 处理对话框提
 */
const handleDialogSubmit = async () => {
  if (active.value === 'batchDelete') {
    // 批量删除逻辑
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要删除的用户')
      return
    }

    const deletePromises = selectedRows.value.map((row: any) => {
      return Api.deleteUser({ userId: row.userId })
    })

    try {
      await Promise.all(deletePromises)
      ElMessage.success(`成功删除 ${selectedRows.value.length} 个用户`)
      getuserlist()
      customDraggingVisible.value = false
    } catch (err: any) {
      ElMessage.error(err?.msg || err?.message || '批量删除失败')
    }
  } else if (active.value === 'add' || active.value === 'edit') {
    // 新增/编辑用户逻辑
    if (!DialogRuleFormRef.value) return

    await DialogRuleFormRef.value.validate(async (valid: boolean) => {
      if (!valid) {
        ElMessage.error('请填写完整信息')
        return
      }

      try {
        if (active.value === 'add') {
          await Api.getUserOperateList({
            ...DialogRuleForm,
            userPwd: '123456',
            action: 'add'
          })
          ElMessage.success('新增用户成功')
          getuserlist()
          customDraggingVisible.value = false
          resetDialogForm()
        } else {
          await Api.getUserOperateList({
            ...DialogRuleForm,
            userId: currentEditUserId.value,
            action: 'edit'
          })
          ElMessage.success('编辑用户成功')
          getuserlist()
          customDraggingVisible.value = false
          resetDialogForm()
        }
      } catch (err: any) {
        ElMessage.error(err?.msg || err?.message || (active.value === 'add' ? '新增用户失败' : '编辑用户失败'))
      }
    })
  }
}

// ==================== 生命周期钩子 ====================

/** 组件挂载时获取数 */
onMounted(() => {
  getuserlist()
  getroleList()
  getdeptList()
})
</script>

<style scoped lang="scss">
// ==================== 分页组件样式 ====================

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  margin-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);

  // 分页信息区域
  .pagination-info {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 13px;
    color: var(--el-text-color-regular, #606266);

    .total-text {
      font-weight: 500;
    }

    .page-text {
      color: var(--el-text-color-secondary, #909399);
    }
  }

  :deep(.el-pagination) {
    font-size: 13px;

    // 总条数文
    .el-pagination__total {
      color: var(--el-text-color-regular, #606266);
      font-size: 13px;
      margin-right: 15px;
    }

    // 每页条数选择
    .el-pagination__sizes {
      margin-right: 15px;

      .el-select {
        .el-input {
          width: 100px;

          .el-input__inner {
            font-size: 13px;
            height: 28px;
            line-height: 28px;
          }
        }
      }
    }

    // 分页按钮
    .btn-prev,
    .btn-next {
      background-color: var(--el-fill-color-light, #f5f7fa);
      border-radius: 4px;
      min-width: 28px;
      height: 28px;
      line-height: 28px;
      padding: 0 6px;
      font-size: 13px;

      &:hover {
        color: var(--el-color-primary, #409eff);
      }

      &.disabled {
        color: var(--el-text-color-placeholder, #a8abb2);
        background-color: var(--el-fill-color-light, #f5f7fa);
      }
    }

    // 页码
    .el-pager {
      li {
        background-color: var(--el-fill-color-light, #f5f7fa);
        border-radius: 4px;
        min-width: 28px;
        height: 28px;
        line-height: 28px;
        font-size: 13px;
        margin: 0 4px;

        &:hover {
          color: var(--el-color-primary, #409eff);
        }

        &.active {
          background-color: var(--el-color-primary, #409eff);
          color: #fff;
        }
      }
    }

    // 跳转输入
    .el-pagination__jump {
      margin-left: 15px;
      font-size: 13px;
      color: var(--el-text-color-regular, #606266);

      .el-input {
        width: 50px;
        margin: 0 5px;

        .el-input__inner {
          font-size: 13px;
          height: 28px;
          line-height: 28px;
          padding: 0 5px;
          text-align: center;
        }
      }
    }
  }
}

// ==================== 用户管理页面样式 ====================

.user-manager {
  padding: 15px;

  // -------------------- 搜索表单样式 --------------------
  :deep(.el-form--inline) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    gap: 15px;
    margin-bottom: 15px;

    .el-form-item {
      margin-bottom: 0;
      margin-right: 0;
      display: flex;
      align-items: center;

      // 输入框和选择框宽
      .el-input,
      .el-select {
        width: 140px;
      }

      // 输入框文字大小和高度
      .el-input__inner,
      .el-select .el-input__inner {
        font-size: 12px;
        height: 28px;
        line-height: 28px;
      }

      // 选择框下拉文字大
      .el-select-dropdown__item {
        font-size: 12px;
      }
    }

    // 标签样式
    .el-form-item__label {
      font-weight: 500;
      color: #606266;
      font-size: 12px;
      padding-right: 6px;
      float: none;
      display: inline-block;
      vertical-align: middle;
    }

    // 按钮容器（最后一个表单项）
    .el-form-item:last-child {
      display: flex;
      flex-wrap: nowrap;
      gap: 8px;

      // 按钮样式
      .el-button {
        font-size: 12px;
        padding: 6px 12px;
        height: 28px;
        margin: 0;
      }
    }
  }

  // -------------------- 控制按钮区域样式 --------------------
  .control-button {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;

    .el-button {
      font-size: 12px;
      padding: 6px 16px;
      height: 28px;
    }
  }

  // -------------------- 表格样式 --------------------
  .user-table {
    :deep(.el-table) {
      font-size: 13px;

      // 表头样式 - 使用 Element Plus CSS 变量
      .el-table__header {
        th {
          background-color: var(--el-fill-color-light, #f5f7fa);
          color: var(--el-text-color-regular, #606266);
          font-weight: 600;
          padding: 8px 0;
        }
      }

      // 单元格样
      .el-table__cell {
        padding: 8px 0;
      }

      // 操作列按钮样
      .el-button {
        font-size: 12px;
        padding: 5px 10px;
        height: 26px;
        margin: 0 3px;

        &:first-child {
          margin-left: 0;
        }

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>