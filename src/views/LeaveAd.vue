<template>
  <div class="leave-manager">
    <!-- ==================== 搜索区域 ==================== -->
    <div class="search-area">
      <el-form :inline="true" :model="leaveRuleForm" class="demo-form-inline">
        <el-form-item label="审批状态">
          <el-select v-model="leaveRuleForm.status" placeholder="请选择审批状态" style="width: 180px;">
            <el-option :label="item.label" :value="item.value" v-for="(item, index) in statusOptions" :key="index" />
          </el-select>
        </el-form-item>
        <el-form-item label="休假类型">
          <el-select v-model="leaveRuleForm.leaveType" placeholder="请选择休假类型" style="width: 180px;">
            <el-option :label="item.label" :value="item.value" v-for="(item, index) in leaveTypeOptions" :key="index" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- ==================== 操作按钮区域 ==================== -->
    <div class="control-button">
      <el-button type="primary" @click="handleAddClick">新增</el-button>
    </div>

    <!-- ==================== 休假表格区域 ==================== -->
    <div class="leave-table">
      <el-table :data="tableData" style="width: 100%">
        <!-- 动态渲染数据列 -->
        <el-table-column :label="item.label" :prop="item.prop" :width="item.width" v-for="(item, t) in columns"
          :key="t" />

        <!-- 操作列 -->
        <el-table-column align="center" label="操作" width="200">
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

      <!-- 分页组件 -->
      <div class="pagination">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>

      <!-- ==================== 对话框组件 ==================== -->
      <el-dialog v-model="customDraggingVisible" :title="dialogTitle" width="600" align-center>
        <!-- 新增/编辑休假表单 -->
        <div v-if="active === 'add' || active === 'edit'">
          <el-form ref="DialogRuleFormRef" style="max-width: 600px" :model="DialogRuleForm" :rules="DialogRules"
            label-width="100px">
            <!-- 休假时间 -->
            <el-form-item label="休假时间" prop="leaveDate" required>
              <el-date-picker v-model="DialogRuleForm.leaveDate" type="daterange" range-separator="至"
                start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" @change="handleDateChange" />
            </el-form-item>

            <!-- 休假时长 -->
            <el-form-item label="休假时长" prop="leaveDuration" required>
              <el-input v-model="DialogRuleForm.leaveDuration" placeholder="请输入休假时长（天）" style="width: 100%;" readonly />
            </el-form-item>

            <!-- 休假类型 -->
            <el-form-item label="休假类型" prop="leaveType" required>
              <el-select v-model="DialogRuleForm.leaveType" placeholder="请选择休假类型" style="width: 100%;">
                <el-option :label="item.label" :value="item.value" v-for="(item, index) in leaveTypeOptions"
                  :key="index" />
              </el-select>
            </el-form-item>

            <!-- 休假原因 -->
            <el-form-item label="休假原因" prop="leaveReason" required>
              <el-input v-model="DialogRuleForm.leaveReason" type="textarea" placeholder="请输入休假原因" style="width: 100%;"
                rows="3" />
            </el-form-item>

            <!-- 审批状态 -->
            <el-form-item label="审批状态">
              <el-select v-model="DialogRuleForm.status" placeholder="请选择审批状态" style="width: 100%;">
                <el-option :label="item.label" :value="item.value" v-for="(item, index) in statusOptions"
                  :key="index" />
              </el-select>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import Api from './../api'

// 导入类型定义
/// <reference path="../../types/user.d.ts" />

// ==================== 类型定义 ====================

// 休假类型
interface Leave {
  leaveId?: string | number
  _id?: string | number
  leaveDate: string | [string, string]
  leaveDuration: number
  leaveType: string
  leaveReason: string
  status: number
  createTime?: string
}

interface LeaveForm {
  leaveId?: string | number
  leaveDate: [string, string] | null
  leaveDuration: number
  leaveType: string
  leaveReason: string
  status: number
}

// ==================== 表格数据 ====================

/** 搜索表单数据 */
const leaveRuleForm = reactive({
  status: null as number | null,
  leaveType: null as string | null
})

/** 所有休假数据（用于前端分页） */
const allTableData = ref<Leave[]>([])

/** 表格数据（当前页显示的数据） */
const tableData = ref<Leave[]>([])

/** 分页参数 */
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

/** 表格列配置 */
const columns = [
  {
    label: '单号',
    prop: 'leaveId',
    width: 120
  },
  {
    label: '休假时间',
    prop: 'leaveDate',
    width: 200
  },
  {
    label: '休假时长',
    prop: 'leaveDuration',
    width: 100,
    formatter: (row: Leave) => {
      return row.leaveDuration + ' 天'
    }
  },
  {
    label: '休假类型',
    prop: 'leaveType',
    width: 120
  },
  {
    label: '休假原因',
    prop: 'leaveReason',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    label: '审批状态',
    prop: 'status',
    width: 120,
    formatter: (row: Leave) => {
      switch (row.status) {
        case 0: return '待审批'
        case 1: return '已通过'
        case 2: return '已拒绝'
        default: return '未知'
      }
    }
  },
  {
    label: '创建时间',
    prop: 'createTime',
    width: 200
  }
]

/** 状态选项 */
const statusOptions = [
  { label: '待审批', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已拒绝', value: 2 }
]

/** 休假类型选项 */
const leaveTypeOptions = [
  { label: '年假', value: '年假' },
  { label: '病假', value: '病假' },
  { label: '事假', value: '事假' },
  { label: '婚假', value: '婚假' },
  { label: '产假', value: '产假' },
  { label: '其他', value: '其他' }
]

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
const DialogRuleForm = reactive<LeaveForm>({
  leaveId: undefined,
  leaveDate: null,
  leaveDuration: 1,
  leaveType: '',
  leaveReason: '',
  status: 0
})

/** 对话框表单验证规则 */
const DialogRules = {
  leaveDate: [
    { required: true, message: '请选择休假时间', trigger: 'blur' }
  ],
  leaveDuration: [
    { required: true, message: '请输入休假时长', trigger: 'blur' },
    { type: 'number', min: 0.5, message: '休假时长至少为0.5天', trigger: 'blur' }
  ],
  leaveType: [
    { required: true, message: '请选择休假类型', trigger: 'blur' }
  ],
  leaveReason: [
    { required: true, message: '请输入休假原因', trigger: 'blur' }
  ]
}

// ==================== 方法定义 ====================

/**
 * 搜索按钮点击事件
 */
const handleSearch = () => {
  getLeaveList()
}

/**
 * 重置按钮点击事件
 */
const handleReset = () => {
  leaveRuleForm.status = null
  leaveRuleForm.leaveType = null
  getLeaveList()
}

/**
 * 分页大小变化事件
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size
  getLeaveList()
}

/**
 * 当前页码变化事件
 */
const handleCurrentChange = (current: number) => {
  currentPage.value = current
  getLeaveList()
}

/**
 * 前端分页
 */
const sliceTableData = () => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  tableData.value = allTableData.value.slice(start, end)
}

/**
 * 获取休假列表数据
 */
const getLeaveList = async () => {
  const params = {
    ...leaveRuleForm,
    page: currentPage.value,
    pageSize: pageSize.value
  }

  try {
    const res: any = await Api.getLeaveList(params)

    // 打印后端返回的数据结构
    console.log('后端返回的 leave 数据:', res)
    console.log('数据类型:', typeof res)
    console.log('是否为数组:', Array.isArray(res))

    // 处理后端返回的数据结构
    let originalData: Leave[] = []
    let totalCount = 0

    if (Array.isArray(res)) {
      // 后端服务返回的结构直接是数组
      originalData = res
      totalCount = res.length
    } else if (res && res.data && Array.isArray(res.data)) {
      // 后端服务返回的结构是 { data: [...] }
      originalData = res.data
      totalCount = res.data.length
    }

    // 打印处理后的数据
    console.log('处理后的数据:', originalData)

    // 保存所有数据
    allTableData.value = originalData
    total.value = totalCount

    // 前端分页
    sliceTableData()
  } catch (err: any) {
    console.error('获取休假列表失败:', err)
    ElMessage.error(err?.msg || err?.message || '获取休假列表失败')
  }
}

/**
 * 新增按钮点击事件
 */
const handleAddClick = () => {
  active.value = 'add'
  dialogTitle.value = '新增休假申请'
  // 重置表单
  Object.assign(DialogRuleForm, {
    leaveId: undefined,
    leaveDate: null,
    leaveDuration: 1,
    leaveType: '',
    leaveReason: '',
    status: 0
  })
  customDraggingVisible.value = true
}

/**
 * 编辑按钮点击事件
 * @param _index 行索引
 * @param row 行数据
 */
const handleEdit = (_index: number, row: Leave) => {
  active.value = 'edit'
  dialogTitle.value = '编辑休假申请'

  // 处理日期格式，将字符串转换为日期范围数组
  let leaveDateValue: [string, string] | null = null
  if (typeof row.leaveDate === 'string' && row.leaveDate.includes('至')) {
    const dateRange = row.leaveDate.split(' 至 ')
    if (dateRange.length === 2) {
      leaveDateValue = [dateRange[0] as string, dateRange[1] as string]
    }
  } else if (Array.isArray(row.leaveDate)) {
    leaveDateValue = row.leaveDate
  }

  // 填充表单数据
  Object.assign(DialogRuleForm, {
    leaveId: row._id || row.leaveId,
    leaveDate: leaveDateValue,
    leaveDuration: row.leaveDuration,
    leaveType: row.leaveType,
    leaveReason: row.leaveReason,
    status: row.status
  })
  customDraggingVisible.value = true
}

/**
 * 删除按钮点击事件
 * @param _index 行索引
 * @param row 行数据
 */
const handleDelete = (_index: number, row: Leave) => {
  ElMessageBox.confirm('确定删除该休假申请吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 使用 _id 作为删除参数，因为后端数据的 ID 字段是 _id
    const leaveId = row._id || row.leaveId
    // 尝试使用 _id 作为参数字段
    const deleteParams = { _id: leaveId }

    Api.deleteLeave(deleteParams).then((res: any) => {
      ElMessage.success(res?.msg || '删除成功')
      getLeaveList()
    }).catch((err: any) => {
      ElMessage.error(err?.msg || err?.message || '删除失败')
    })
  }).catch(() => {
    // 取消删除
  })
}

/**
 * 日期范围变化事件，计算休假时长
 */
const handleDateChange = (value: [string, string] | null) => {
  if (value && value.length === 2) {
    const startDate = new Date(value[0])
    const endDate = new Date(value[1])
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    DialogRuleForm.leaveDuration = diffDays
  }
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
          ...DialogRuleForm,
          action: active.value
        }

        // 处理日期范围，转换为字符串格式
        if (Array.isArray(formData.leaveDate)) {
          formData.leaveDate = formData.leaveDate.join(' 至 ')
        }

        // 如果是编辑操作，将 leaveId 转换为 _id
        if (active.value === 'edit' && DialogRuleForm.leaveId) {
          formData._id = DialogRuleForm.leaveId
          delete formData.leaveId
        }

        // 提交表单
        Api.operateLeave(formData).then((res: any) => {
          ElMessage.success(res?.msg || '操作成功')
          customDraggingVisible.value = false
          getLeaveList()
        }).catch((err: any) => {
          ElMessage.error(err?.msg || err?.message || '操作失败')
        })
      }
    })
  }
}

// ==================== 生命周期 ====================

/**
 * 组件挂载后获取休假列表
 */
onMounted(() => {
  getLeaveList()
})
</script>
<style scoped lang="scss">
.leave-manager {
  padding: 24px;
  min-height: 100vh;
  background: var(--el-bg-color, #ffffff);

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
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
      }
    }
  }

  .control-button {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    .el-button {
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
      }
    }
  }

  .leave-table {
    background: var(--el-bg-color, #ffffff);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 24px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    }

    .el-table {
      border-radius: 8px;
      overflow: hidden;

      .el-table__header-wrapper {
        background-color: var(--el-fill-color-light, #f5f7fa);
        border-bottom: 2px solid #667eea;

        .el-table__header-cell {
          font-weight: 600;
          color: var(--el-text-color-primary, #303133);
          background-color: var(--el-fill-color-light, #f5f7fa);
          text-align: center;
        }
      }

      .el-table__body-wrapper {
        .el-table__row {
          height: 32px;
          transition: all 0.2s ease;

          &:hover {
            background-color: var(--el-fill-color-light, #f5f7fa) !important;
          }

          &.current-row {
            background-color: #e6e9ff !important;
          }
        }

        .el-table__cell {
          padding: 6px 10px;
          white-space: nowrap;
          font-size: 14px;
          color: var(--el-text-color-primary, #303133);
        }
      }
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;

      .el-pagination {
        .el-pagination__sizes {
          margin-right: 10px;
        }
      }
    }
  }
}

.el-dialog {
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    background-color: var(--el-fill-color-light, #f5f7fa);
    border-bottom: 1px solid var(--el-border-color, #ebeef5);
    padding: 20px 24px;

    .el-dialog__title {
      font-weight: 600;
      color: var(--el-text-color-primary, #303133);
      font-size: 16px;
    }
  }

  .el-dialog__body {
    padding: 24px;

    .el-form {
      .el-form-item {
        margin-bottom: 20px;

        .el-form-item__label {
          color: var(--el-text-color-primary, #303133);
        }

        .el-input,
        .el-select,
        .el-date-picker {
          width: 100%;
        }
      }
    }
  }

  .el-dialog__footer {
    background-color: var(--el-fill-color-light, #f5f7fa);
    border-top: 1px solid var(--el-border-color, #ebeef5);
    padding: 16px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
      }
    }
  }
}
</style>
