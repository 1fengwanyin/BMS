<template>
  <div class="role-manager">
    <!-- ==================== 搜索区域 ==================== -->
    <div class="search-area">
      <el-form :inline="true" :model="roleRuleForm" class="demo-form-inline">
        <el-form-item label="角色名称">
          <el-input v-model="roleRuleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- ==================== 操作按钮区域 ==================== -->
    <div class="control-button">
      <el-button type="primary" @click="handleAddClick">创建</el-button>
    </div>

    <!-- ==================== 角色表格区域 ==================== -->
    <div class="role-table">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="roleName" label="角色名称" width="180" />
        <el-table-column prop="remark" label="备注" width="200" />
        <el-table-column prop="permissionList" label="权限列表" width="300" :formatter="formatPermsList" />
        <el-table-column prop="updateTime" label="更新时间" width="200" />
        <el-table-column prop="createTime" label="创建时间" width="200" />
        <el-table-column align="center" label="操作" width="300">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="success" @click="handleSetPerms(scope.$index, scope.row)">
              设置权限
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- ==================== 分页区域 ==================== -->
      <div class="pagination">
        <el-pagination background layout="sizes, prev, pager, next, jumper, ->, total" :total="total"
          :page-size="pageSize" :page-sizes="[5, 10, 20]" :current-page="currentPage" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- ==================== 对话框组 ==================== -->
    <el-dialog v-model="customDraggingVisible" :title="dialogTitle" width="500" align-center>
      <!-- 新增/编辑角色表单 -->
      <div v-if="active === 'add' || active === 'edit'">
        <el-form ref="DialogRuleFormRef" style="max-width: 600px" :model="DialogRuleForm" :rules="DialogRules"
          label-width="100px">
          <!-- 角色名称 -->
          <el-form-item label="角色名称" prop="roleName" required>
            <el-input v-model="DialogRuleForm.roleName" placeholder="请输入角色名称" style="width: 300px;" />
          </el-form-item>

          <!-- 备注 -->
          <el-form-item label="备注">
            <el-input v-model="DialogRuleForm.roleDesc" placeholder="请输入备注" style="width: 300px;" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 设置权限对话框 -->
      <div v-else-if="active === 'setPerms'">
        <div class="perms-setting">
          <h4>设置权限</h4>
          <div class="role-name">
            角色名称: {{ currentRoleName }}
          </div>
          <div class="perms-tree">
            <el-tree ref="treeRef" style="max-width: 600px" :data="permissionTree" show-checkbox node-key="id"
              :default-checked-keys="selectedPerms" :props="treeProps" :check-strictly="true" />
          </div>
        </div>
      </div>

      <!-- 对话框底部按�?-->
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
const roleRuleForm = reactive({
  roleName: ''
})

/** 所有角色数据（用于前端分页） */
const allTableData = ref<Role[]>([])

/** 表格数据（当前页显示的数据） */
const tableData = ref<Role[]>([])

/** 分页参数 */
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)



/** 选中的权限 */
const selectedPerms = ref<string[]>([])

/** 当前角色名称 */
const currentRoleName = ref('')

/** 当前角色ID */
const currentRoleId = ref<string | number | undefined>('')

/** 权限树数据 */
const permissionTree = ref<any[]>([])

/** 菜单ID到名称的映射 */
const menuIdToNameMap = ref(new Map())

/**
 * 获取菜单数据并构建权限树
 */
const fetchMenuData = async () => {
  try {
    const res: any = await Api.getMenuList()

    let menuList: any[] = []

    // 调整判断条件，处理不同的数据结构
    if (res) {
      if (res.data && res.data.list) {
        // 结构1: { code: 200, data: { list: [...] } }
        menuList = res.data.list
      } else if (res.list) {
        // 结构2: { list: [...], total: ... }
        menuList = res.list
      } else if (Array.isArray(res)) {
        // 结构3: [...] 直接是数组
        menuList = res
      } else {
      }
    } else {
    }

    if (menuList.length > 0) {
      // 构建权限树
      const tree = buildPermissionTree(menuList)
      permissionTree.value = tree
    } else {
      permissionTree.value = []
    }
  } catch (error) {
    // 发生错误时显示空权限树
    permissionTree.value = []
  }
}

/**
 * 根据菜单数据构建权限树 */
const buildPermissionTree = (menuList: any[]): any[] => {
  // 构建菜单映射
  const menuMap = new Map()
  const rootMenus: any[] = []
  // 重置菜单ID到名称的映射
  menuIdToNameMap.value = new Map()

  // 首先创建所有菜单项
  menuList.forEach(menu => {
    const menuId = menu._id || menu.id
    const menuName = menu.menuName || menu.name
    menuMap.set(menuId, {
      id: menuId,
      label: menuName,
      children: []
    })
    // 构建菜单ID到名称的映射
    menuIdToNameMap.value.set(menuId, menuName)
  })

  // 构建菜单树，包括一级、二级和三级权限
  // 首先添加所有根菜单（一级权限）
  menuList.forEach(menu => {
    const menuId = menu._id || menu.id
    const parentId = menu.parentId

    if (!parentId) {
      // 根菜单，一级权限
      rootMenus.push(menuMap.get(menuId))
    }
  })

  // 然后添加所有二级和三级权限
  menuList.forEach(menu => {
    const menuId = menu._id || menu.id
    const parentId = menu.parentId
    const menuName = menu.menuName || menu.name

    if (parentId) {
      // 子菜单
      const parent = menuMap.get(parentId)
      if (parent) {
        // 检查父菜单是否是根菜单（一级权限）
        const isParentRoot = menuList.some(m => (m._id || m.id) === parentId && !m.parentId)
        if (isParentRoot) {
          // 父菜单是根菜单，所以当前菜单是二级权限
          parent.children.push(menuMap.get(menuId))
        } else {
          // 父菜单不是根菜单，所以当前菜单是三级权限
          // 按照规则命名权限：二级菜单去掉"管理"两字加上三级菜单的名称
          const parentName = parent.label.replace('管理', '')
          const newMenuName = parentName + menuName
          // 更新菜单名称
          const menuItem = menuMap.get(menuId)
          if (menuItem) {
            menuItem.label = newMenuName
          }
          // 更新菜单ID到名称的映射
          menuIdToNameMap.value.set(menuId, newMenuName)
          // 将三级菜单添加到二级菜单的children中
          parent.children.push(menuMap.get(menuId))
        }
      }
    }
  })

  return rootMenus
}

/** 树组件配置 */
const treeProps = {
  children: 'children',
  label: 'label',
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

/** 权限树组件实例 */
const treeRef = ref<any>()

/** 对话框表单数据 */
const DialogRuleForm = reactive<RoleForm>({
  roleId: undefined,
  roleName: '',
  roleDesc: '',
  perms: []
})

/** 对话框表单验证规则 */
const DialogRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ]
}

// ==================== 方法定义 ====================

/**
 * 搜索按钮点击事件
 */
const handleSearch = () => {
  getRoleList()
}

/**
 * 重置按钮点击事件
 */
const handleReset = () => {
  roleRuleForm.roleName = ''
  getRoleList()
}

/**
 * 分页大小变化事件
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size
  getRoleList()
}

/**
 * 当前页码变化事件
 */
const handleCurrentChange = (current: number) => {
  currentPage.value = current
  getRoleList()
}

/**
 * 格式化权限列表 */
const formatPermsList = (row: Role) => {
  if (row.permissionList) {
    const halfCheckedKeys = row.permissionList.halfCheckedKeys || []
    if (halfCheckedKeys.length > 0) {
      // 将权限ID转换为菜单名称
      const permNames = halfCheckedKeys.map(key => menuIdToNameMap.value.get(key) || key)
        // 过滤掉三级菜单的权限（包含操作动词的权限），只显示二级菜单的权限
        .filter(name => typeof name === 'string' && !(name.includes('查看') || name.includes('编辑') || name.includes('新增') || name.includes('删除')))
      return permNames.join(', ')
    }
    return ''
  }
  if (row.permsList && row.permsList.length > 0) {
    // 将权限ID转换为菜单名称
    const permNames = row.permsList.map(key => menuIdToNameMap.value.get(key) || key)
    return permNames.join(', ')
  }
  return ''
}

/**
 * 获取角色列表数据
 */
const getRoleList = async () => {
  const params = {
    ...roleRuleForm,
    page: currentPage.value,
    pageSize: pageSize.value
  }

  try {
    const res: any = await Api.getRoleList(params)

    // 处理后端返回的数据结构
    let originalData: Role[] = []
    let totalCount = 0

    if (res.data && res.data.list) {
      // 后端服务返回的结构 { code: 200, data: { page: { ... }, list: [...] } }
      originalData = res.data.list
      totalCount = res.data.page?.total || res.data.list.length
    } else if (Array.isArray(res)) {
      // mock 服务返回的结构 data 直接是数组
      originalData = res
      totalCount = res.length
    } else if (res.list) {
      // 另一种后端服务返回的结构: { list: [...], total: ... }
      originalData = res.list
      totalCount = res.total || res.list.length
    }

    // 前端搜索过滤
    let filteredData = originalData
    if (roleRuleForm.roleName) {
      const searchTerm = roleRuleForm.roleName.toLowerCase()
      filteredData = originalData.filter(role =>
        role.roleName.toLowerCase().includes(searchTerm)
      )
      totalCount = filteredData.length
    }

    // 保存所有数据
    allTableData.value = filteredData
    total.value = totalCount

    // 前端分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    tableData.value = filteredData.slice(start, end)
  } catch (err: any) {
    ElMessage.error(err?.msg || err?.message || '获取角色列表失败')
  }
}

/**
 * 新增按钮点击事件
 */
const handleAddClick = () => {
  active.value = 'add'
  dialogTitle.value = '新增角色'
  // 重置表单
  Object.assign(DialogRuleForm, {
    roleId: undefined,
    roleName: '',
    roleDesc: '',
    perms: []
  })
  customDraggingVisible.value = true
}

/**
 * 编辑按钮点击事件
 * @param _index 行索引
 * @param row 行数据 */
const handleEdit = (_index: number, row: Role) => {
  active.value = 'edit'
  dialogTitle.value = '编辑角色'
  // 填充表单数据
  Object.assign(DialogRuleForm, {
    roleId: row._id || row.roleId,
    roleName: row.roleName,
    roleDesc: row.remark || row.roleDesc || '',
    perms: []
  })
  customDraggingVisible.value = true
}

/**
 * 设置权限按钮点击事件
 * @param _index 行索引
 * @param row 行数据 */
const handleSetPerms = (_index: number, row: Role) => {
  active.value = 'setPerms'
  dialogTitle.value = '设置权限'
  // 设置当前角色名称和ID
  currentRoleName.value = row.roleName
  currentRoleId.value = row._id || row.roleId
  // 填充权限数据
  if (row.permissionList) {
    selectedPerms.value = [...(row.permissionList.checkedKeys || []), ...(row.permissionList.halfCheckedKeys || [])]
  } else {
    selectedPerms.value = row.permsList || []
  }
  customDraggingVisible.value = true
}

/**
 * 删除按钮点击事件
 * @param _index 行索引
 * @param row 行数据 */
const handleDelete = (_index: number, row: Role) => {
  ElMessageBox.confirm('确定删除该角色吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 使用 _id 作为删除参数，因为后端数据的 ID 字段�?_id
    const roleId = row._id || row.roleId
    // 尝试使用 _id 作为参数字段
    const deleteParams = { _id: roleId }

    try {
      Api.deleteRole(deleteParams).then(() => {
        ElMessage.success('删除成功')
        getRoleList()
      })
    } catch (error) {
      ElMessage.error('删除角色失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

/**
 * 对话框确认按钮点击事件 */
const handleDialogConfirm = () => {
  if (active.value === 'add' || active.value === 'edit') {
    // 表单验证
    DialogRuleFormRef.value?.validate((valid, _fields) => {
      if (valid) {
        // 处理表单数据
        const formData: any = {
          roleName: DialogRuleForm.roleName,
          remark: DialogRuleForm.roleDesc,
          action: active.value
        }

        // 如果是编辑操作，�?roleId 转换�?_id
        if (active.value === 'edit' && DialogRuleForm.roleId) {
          formData._id = DialogRuleForm.roleId
        }

        try {
          Api.operateRole(formData).then(() => {
            ElMessage.success('操作成功')
            customDraggingVisible.value = false
            getRoleList()
          })
        } catch (error) {
          ElMessage.error('操作角色失败')
        }
      }
    })
  } else if (active.value === 'setPerms') {
    // 处理设置权限
    // 获取所有选中的节点
    const checkedKeys = treeRef.value?.getCheckedKeys() || []

    const permData = {
      _id: currentRoleId.value,
      permissionList: { checkedKeys: [], halfCheckedKeys: checkedKeys },
      action: 'edit'
    }

    try {
      Api.operateRole(permData).then(() => {
        ElMessage.success('权限设置成功')
        customDraggingVisible.value = false
        getRoleList()
      })
    } catch (error) {
      ElMessage.error('设置权限失败')
    }
  }
}

// ==================== 生命周期 ====================

/**
 * 组件挂载后获取角色列表和菜单数据
 */
onMounted(async () => {
  // 先获取菜单数据，构建权限映射，然后再获取角色列表
  await fetchMenuData()
  getRoleList()
})
</script>

<style scoped lang="scss">
.role-manager {
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

  .role-table {
    background: var(--el-bg-color, #ffffff);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 24px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    }

    .el-table {
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

      .el-button {
        margin-right: 8px;

        &:last-child {
          margin-right: 0;
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

  .perms-setting {
    h4 {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 16px;
      color: var(--el-text-color-primary, #303133);
    }

    .role-name {
      font-size: 14px;
      margin-bottom: 20px;
      color: var(--el-text-color-secondary, #606266);
    }

    .perms-tree {
      margin-top: 20px;
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid var(--el-border-color, #e4e7ed);
      border-radius: 6px;
      padding: 16px;
      background-color: var(--el-bg-color, #ffffff);

      .el-tree-node {
        margin-bottom: 8px;

        .el-tree-node__content {
          height: 32px;

          .el-checkbox {
            margin-right: 8px;
          }
        }
      }
    }
  }
}
</style>
