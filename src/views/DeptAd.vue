<template>
  <div class="dept-manager">
    <!-- ==================== 搜索区域 ==================== -->
    <div class="search-area">
      <el-form :inline="true" :model="deptRuleForm" class="demo-form-inline" @submit.prevent>
        <el-form-item label="部门名称">
          <el-input v-model="deptRuleForm.deptName" placeholder="请输入部门名称" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- ==================== 操作按钮区域 ==================== -->
    <div class="control-button">
      <el-button type="primary" @click="handleAddClick">创建</el-button>
    </div>

    <!-- ==================== 部门表格区域 ==================== -->
    <div class="dept-table">
      <el-table :data="tableData" style="width: 100%" :tree-props="{ hasChildren: 'hasChildren', children: 'children' }"
        row-key="_id" :loading="loading">
        <el-table-column prop="deptName" label="部门名称" min-width="180" />
        <el-table-column prop="userName" label="负责人" min-width="180" />
        <el-table-column prop="updateTime" label="更新时间" min-width="200" />
        <el-table-column prop="createTime" label="注册时间" min-width="200" />
        <el-table-column align="center" label="操作" min-width="200">
          <template #default="scope">
            <el-button size="small" @click="handleAdd(scope.$index, scope.row)">
              新增
            </el-button>
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ==================== 对话框组件 ==================== -->
    <el-dialog v-model="customDraggingVisible" :title="dialogTitle" width="500" align-center>
      <!-- 新增/编辑部门表单 -->
      <div v-if="active === 'add' || active === 'edit'">
        <el-form ref="DialogRuleFormRef" style="max-width: 600px" :model="DialogRuleForm" :rules="DialogRules"
          label-width="120px">
          <!-- 选择部门 -->
          <el-form-item label="选择部门">
            <el-select v-model="DialogRuleForm.parentId" placeholder="请选择" style="width: 300px;">
              <el-option v-for="dept in allTableData" :key="dept._id || dept.deptId" :label="dept.deptName"
                :value="dept._id || dept.deptId" />
            </el-select>
            <div class="select-hint">不选择则为一级部门</div>
          </el-form-item>

          <!-- 公司/部门名称 -->
          <el-form-item label="公司/部门名称" prop="deptName" required>
            <el-input v-model="DialogRuleForm.deptName" placeholder="请输入您部门名称" style="width: 300px;" />
          </el-form-item>

          <!-- 员工名称 -->
          <el-form-item label="员工名称" required>
            <el-select v-model="DialogRuleForm.userId" placeholder="请选择" style="width: 300px;"
              @change="handleUserChange">
              <el-option v-for="employee in employeeList" :key="employee.value" :label="employee.label"
                :value="employee.value" :disabled="isUserAssigned(employee.label)" />
            </el-select>
          </el-form-item>

          <!-- 员工邮箱 -->
          <el-form-item label="员工邮箱">
            <el-input v-model="DialogRuleForm.userEmail" placeholder="请输入您的邮箱" style="width: 300px;" :disabled="true" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="customDraggingVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import Api from './../api'

// ==================== 表格数据 ====================

/** 搜索表单数据 */
const deptRuleForm = reactive({
  deptName: ''
})

/** 所有部门数据（用于前端分页） */
const allTableData = ref<Dept[]>([])

/** 表格数据（当前页显示的数据） */
const tableData = ref<Dept[]>([])

/** 员工列表数据 */
const employeeList = ref<Array<{ value: string; label: string; email: string }>>([])

/** 搜索加载状态 */
const loading = ref(false)

/** 获取员工列表数据 */
const getUserList = async () => {
  try {
    const res: any = await Api.getUserList()
    if (res && res.list) {
      // 转换为select组件需要的格式
      employeeList.value = res.list.map((user: any) => ({
        value: String(user._id || user.userId),
        label: user.userName,
        email: user.userEmail || ''
      }))
    }
  } catch (error) {
    console.error('获取员工列表失败:', error)
    // 使用默认数据作为 fallback
    employeeList.value = [
      { value: '1', label: '艾特米', email: 'aitemi@example.com' },
      { value: '2', label: '西阳子', email: 'xiyangzi@example.com' },
      { value: '3', label: '王之环', email: 'wangzhihuan@example.com' },
      { value: '4', label: '张三', email: 'zhangsan@example.com' },
      { value: '5', label: '李四', email: 'lisi@example.com' }
    ]
  }
}



// ==================== 对话框相关 ====================

/** 对话框显示状态 */
const customDraggingVisible = ref(false)

/** 当前操作类型 */
const active = ref('')

/** 对话框标题 */
const dialogTitle = ref('')

/** 对话框表单实例 */
const DialogRuleFormRef = ref<FormInstance>()

/** 对话框表单数据 */
const DialogRuleForm = reactive<DeptForm>({
  deptId: undefined,
  deptName: '',
  deptDesc: '',
  userName: '',
  userEmail: '',
  parentId: [],
  userId: ''
})

/** 对话框表单验证规则 */
const DialogRules = {
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
  ]
}

// ==================== 方法定义 ====================

/**
 * 搜索按钮点击事件
 */
const handleSearch = async () => {
  loading.value = true
  try {
    await getDeptList()
    // 搜索完成后显示提示
    if (tableData.value.length === 0) {
      ElMessage.info('未找到匹配的部门')
    } else {
      ElMessage.success(`找到 ${tableData.value.length} 个匹配的部门`)
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 重置按钮点击事件
 */
const handleReset = async () => {
  deptRuleForm.deptName = ''
  loading.value = true
  try {
    await getDeptList()
    ElMessage.success('已重置搜索条件')
  } catch (error) {
    console.error('重置失败:', error)
    ElMessage.error('重置失败，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 处理用户选择变化
 */
const handleUserChange = (userId: string) => {
  const employee = employeeList.value.find(emp => emp.value === userId)
  if (employee) {
    DialogRuleForm.userName = employee.label
    DialogRuleForm.userEmail = employee.email
  } else {
    DialogRuleForm.userName = ''
    DialogRuleForm.userEmail = ''
  }
}

/**
 * 检查用户是否已经被分配到其他部门
 */
const isUserAssigned = (userName: string): boolean => {
  return allTableData.value.some(dept => dept.userName === userName)
}



/**
 * 构建树形结构
 */
const buildTree = (data: Dept[]): Dept[] => {
  const map = new Map<string | number, Dept>()
  const roots: Dept[] = []

  // 首先将所有部门放入映射中
  data.forEach(dept => {
    const key = dept._id || dept.deptId
    map.set(key, {
      ...dept,
      children: [],
      hasChildren: false
    })
  })

  // 构建树形结构
  data.forEach(dept => {
    const deptId = dept._id || dept.deptId
    const parentId = dept.parentId

    if (parentId && Array.isArray(parentId) && parentId.length > 0) {
      // 子部门
      const parentKey = parentId[0]
      if (parentKey && parentKey !== null && parentKey !== '') {
        const parent = map.get(parentKey)
        if (parent && parent.children) {
          const child = map.get(deptId)
          if (child) {
            parent.children.push(child)
            parent.hasChildren = true
          }
        } else {
          // 父部门不在过滤结果中，将子部门视为根部门
          const root = map.get(deptId)
          if (root) {
            roots.push(root)
          }
        }
      } else {
        // 根部门（parentId为[null]或['']的情况）
        const root = map.get(deptId)
        if (root) {
          roots.push(root)
        }
      }
    } else {
      // 根部门
      const root = map.get(deptId)
      if (root) {
        roots.push(root)
      }
    }
  })

  return roots
}

/**
 * 获取部门列表数据
 */
const getDeptList = async () => {
  const params = {
    ...deptRuleForm
  }

  try {
    const res: any = await Api.getDeptList(params)

    // 处理不同的数据结构
    let originalData: Dept[] = []
    let totalCount = 0

    if (res && res.list) {
      // 后端服务返回的结构: data.list 是数组
      originalData = res.list
      totalCount = res.total || res.list.length
    } else if (Array.isArray(res)) {
      // mock 服务返回的结构: data 直接是数组
      originalData = res
      totalCount = res.length
    }

    // 按部门名称过滤
    let filteredData = originalData
    if (deptRuleForm.deptName) {
      const searchTerm = deptRuleForm.deptName.toLowerCase()
      filteredData = filteredData.filter(item => {
        const deptName = item.deptName?.toLowerCase() || ''
        return deptName.includes(searchTerm)
      })
    }

    // 保存所有数据
    allTableData.value = filteredData

    // 构建树形结构
    const treeData = buildTree(filteredData)
    tableData.value = treeData
  } catch (err: any) {
    // 使用模拟数据
    const mockData: Dept[] = [
      {
        deptId: 1,
        _id: 1,
        deptName: '技术部',
        deptDesc: '负责公司技术开发',
        userName: '艾特米',
        userEmail: 'aitemi@example.com',
        createTime: '2023-05-29 10:57:11',
        updateTime: '2023-05-29 10:57:11'
      },
      {
        deptId: 2,
        _id: 2,
        deptName: '西阳子',
        deptDesc: '负责公司运营管理',
        userName: '西阳子',
        userEmail: 'xiyangzi@example.com',
        parentId: [1],
        createTime: '2023-05-29 10:32:21',
        updateTime: '2023-05-29 10:32:21'
      }
    ]

    // 按部门名称过滤
    let filteredData = mockData
    if (deptRuleForm.deptName) {
      const searchTerm = deptRuleForm.deptName.toLowerCase()
      filteredData = filteredData.filter(item => {
        const deptName = item.deptName?.toLowerCase() || ''
        return deptName.includes(searchTerm)
      })
    }

    // 保存所有数据
    allTableData.value = filteredData

    // 构建树形结构
    const treeData = buildTree(filteredData)
    tableData.value = treeData

    ElMessage.info('使用模拟数据')
  }
}

/**
 * 新增按钮点击事件
 */
const handleAddClick = () => {
  active.value = 'add'
  dialogTitle.value = '创建'
  // 重置表单
  Object.assign(DialogRuleForm, {
    deptId: undefined,
    deptName: '',
    deptDesc: '',
    userName: '',
    userEmail: '',
    parentId: [],
    userId: ''
  })
  customDraggingVisible.value = true
}

/**
 * 新增子部门按钮点击事件
 * @param _index 行索引
 * @param row 行数据
 */
const handleAdd = (_index: number, row: Dept) => {
  active.value = 'add'
  dialogTitle.value = '创建'
  // 重置表单
  Object.assign(DialogRuleForm, {
    deptId: undefined,
    deptName: '',
    deptDesc: '',
    userName: '',
    userEmail: '',
    parentId: row._id || row.deptId,
    userId: ''
  })
  customDraggingVisible.value = true
}

/**
 * 编辑按钮点击事件
 * @param _index 行索引
 * @param row 行数据
 */
const handleEdit = (_index: number, row: Dept) => {
  active.value = 'edit'
  dialogTitle.value = '编辑'
  // 根据 userName 查找对应的 userId
  let userId = ''
  let userName = ''
  let userEmail = ''
  if (row.userName) {
    const employee = employeeList.value.find(emp => emp.label === row.userName)
    if (employee) {
      userId = employee.value
      userName = employee.label
      userEmail = employee.email
    } else {
      userName = row.userName
      userEmail = row.userEmail || ''
    }
  } else if (row.userId) {
    userId = String(row.userId)
    const employee = employeeList.value.find(emp => emp.value === String(row.userId))
    if (employee) {
      userName = employee.label
      userEmail = employee.email
    }
  }
  // 填充表单数据
  Object.assign(DialogRuleForm, {
    deptId: row._id || row.deptId,
    deptName: row.deptName,
    deptDesc: row.deptDesc || '',
    userName: userName,
    userEmail: userEmail,
    parentId: Array.isArray(row.parentId) && row.parentId.length > 0 ? row.parentId[0] : row.parentId || '',
    userId: userId
  })
  customDraggingVisible.value = true
}

/**
 * 删除按钮点击事件
 * @param _index 行索引
 * @param row 行数据
 */
const handleDelete = (_index: number, row: Dept) => {
  ElMessageBox.confirm('确定删除该部门吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 使用 _id 作为删除参数，因为后端数据的 ID 字段是 _id
    const deptId = row._id || row.deptId
    const deleteParams = { _id: deptId }

    try {
      Api.deleteDept(deleteParams).then(() => {
        ElMessage.success('删除成功')
        getDeptList()
      })
    } catch (error) {
      console.error('删除部门失败:', error)
      ElMessage.error('删除部门失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

/**
 * 对话框确认按钮点击事件
 */
const handleDialogConfirm = () => {
  if (active.value === 'add' || active.value === 'edit') {
    // 表单验证
    DialogRuleFormRef.value?.validate((valid, _fields) => {
      if (valid) {
        // 处理表单数据
        const formData: any = {
          deptName: DialogRuleForm.deptName,
          userName: DialogRuleForm.userName,
          userEmail: DialogRuleForm.userEmail,
          parentId: DialogRuleForm.parentId ? [DialogRuleForm.parentId] : [],
          userId: DialogRuleForm.userId,
          action: active.value
        }

        // 如果是编辑操作，将 deptId 转换为 _id
        if (active.value === 'edit' && DialogRuleForm.deptId) {
          formData._id = DialogRuleForm.deptId
        }

        try {
          Api.operateDept(formData).then(() => {
            ElMessage.success('操作成功')
            customDraggingVisible.value = false
            getDeptList()
          })
        } catch (error) {
          console.error('操作部门失败:', error)
          ElMessage.error('操作部门失败')
        }
      }
    })
  }
}

// ==================== 生命周期 ====================

/**
 * 组件挂载后获取部门列表和员工列表
 */
onMounted(async () => {
  await getUserList()
  getDeptList()
})
</script>

<style scoped lang="scss">
.dept-manager {
  padding: 24px;
  min-height: 100vh;
  background: var(--el-bg-color, #ffffff);
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;

  .search-area {
    background: var(--el-bg-color, #ffffff);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 24px;
    margin-bottom: 20px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    }

    .el-form {
      display: flex;
      align-items: center;
      gap: 16px;

      .el-form-item {
        margin-bottom: 0;

        .el-form-item__label {
          color: var(--el-text-color-primary, #303133);
        }
      }

      .el-button {
        border-radius: 6px;
        font-weight: 500;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }

  .control-button {
    margin-bottom: 20px;

    .el-button {
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .dept-table {
    background: var(--el-bg-color, #ffffff);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 24px;
    transition: all 0.3s ease;
    min-width: 1300px;
    overflow-x: auto;

    &:hover {
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    }

    .el-table {
      width: 100% !important;
      margin-bottom: 20px;

      .el-table__header-wrapper {
        .el-table__header {
          th {
            background-color: var(--el-fill-color-light, #f5f7fa);
            color: var(--el-text-color-primary, #303133);
            font-weight: 500;
            text-align: center;
          }
        }
      }

      .el-table__body-wrapper {
        .el-table__row {
          &:hover {
            background-color: var(--el-fill-color-light, #f5f7fa);
          }
        }
      }
    }

    .pagination {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;

      .el-pagination {
        .el-pagination__sizes {
          margin-right: 16px;
        }

        .el-pagination__total {
          margin-right: 16px;
        }
      }
    }
  }

  /* 对话框样式 */
  .el-dialog {
    .el-dialog__header {
      padding: 20px 24px;
    }

    .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
    }

    .el-dialog__body {
      padding: 24px;
    }

    .el-form {
      .el-form-item {
        margin-bottom: 16px;

        .el-form-item__label {
          font-size: 14px;
          color: #606266;
        }

        .el-form-item__content {
          font-size: 14px;
        }

        .el-input.is-disabled {
          background-color: #f5f7fa;
          color: #909399;
        }

        .el-select {
          width: 300px;
        }

        .el-input {
          width: 300px;
        }

        .select-hint {
          font-size: 12px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }

    .dialog-footer {
      text-align: right;
      padding: 16px 24px 20px;

      .el-button {
        margin-left: 8px;

        &:first-child {
          margin-left: 0;
        }
      }
    }
  }
}
</style>