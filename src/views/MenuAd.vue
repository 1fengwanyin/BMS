<template>
  <div class="menu-manager">
    <!-- ==================== 搜索区域 ==================== -->
    <div class="search-area">
      <el-form :inline="true" :model="menuRuleForm" class="demo-form-inline">
        <el-form-item label="菜单名称">
          <el-input v-model="menuRuleForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单状态">
          <el-select v-model="menuRuleForm.status" placeholder="请选择菜单状态" style="width: 180px;">
            <el-option :label="item.label" :value="item.value" v-for="(item, index) in statusOptions" :key="index" />
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
      <el-button type="primary" @click="handleAddClick">创建</el-button>
    </div>

    <!-- ==================== 菜单表格区域 ==================== -->
    <div class="menu-table">
      <el-table :data="tableData" style="width: 100%" row-key="menuId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren', expandTrigger: 'row' }" default-expand-all>
        <!-- 动态渲染数据列 -->
        <el-table-column :label="item.label" :prop="item.prop" :width="item.width" v-for="(item, t) in columns" :key="t"
          :formatter="item.formatter" />

        <!-- 操作列 -->
        <el-table-column align="center" label="操作" width="300">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleAddClick(scope.row)">
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



      <!-- ==================== 对话框组件 ==================== -->
      <el-dialog v-model="customDraggingVisible" :title="dialogTitle" width="500" align-center>
        <!-- 新增/编辑菜单表单 -->
        <div v-if="active === 'add' || active === 'edit'">
          <el-form ref="DialogRuleFormRef" style="max-width: 600px" :model="DialogRuleForm" :rules="DialogRules"
            label-width="100px">
            <!-- 父级菜单 -->
            <el-form-item label="父级菜单">
              <el-cascader v-model="DialogRuleForm.parentId" :options="parentMenuOptions"
                :props="{ checkStrictly: true }" placeholder="请选择" clearable style="width: 300px;" />
              <span style="margin-left: 10px; color: #909399; font-size: 12px;">不写则为一级菜单</span>
            </el-form-item>

            <!-- 菜单类型 -->
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="DialogRuleForm.menuType">
                <el-radio label="1">菜单</el-radio>
                <el-radio label="2">按钮</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 菜单名称 -->
            <el-form-item label="菜单名称" prop="menuName" required>
              <el-input v-model="DialogRuleForm.menuName" placeholder="请输入您的菜单名称" style="width: 300px;" />
            </el-form-item>

            <!-- 菜单图标 -->
            <el-form-item label="菜单图标">
              <el-input v-model="DialogRuleForm.menuIcon" placeholder="请输入您的菜单图标" style="width: 300px;" />
            </el-form-item>

            <!-- 路由地址 -->
            <el-form-item label="路由地址">
              <el-input v-model="DialogRuleForm.menuPath" placeholder="请输入您的路由地址" style="width: 300px;" />
            </el-form-item>

            <!-- 组件路径 -->
            <el-form-item label="组件路径">
              <el-input v-model="DialogRuleForm.menuComponent" placeholder="请输入您的组件路径" style="width: 300px;" />
            </el-form-item>

            <!-- 菜单状态 -->
            <el-form-item label="菜单状态">
              <el-radio-group v-model="DialogRuleForm.status">
                <el-radio :label="0">正常</el-radio>
                <el-radio :label="1">禁用</el-radio>
              </el-radio-group>
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

// ==================== 类型定义 ====================

// ==================== 表格数据 ====================

/** 搜索表单数据 */
const menuRuleForm = reactive({
  menuName: '',
  status: null as number | null
})

/** 所有菜单数据（用于前端分页） */
const allTableData = ref<Menu[]>([])

/** 表格数据（当前页显示的数据） */
const tableData = ref<Menu[]>([])





/** 表格列配置 */
const columns = [
  {
    label: '菜单名称',
    prop: 'menuName',
    width: 180
  },
  {
    label: '图标',
    prop: 'menuIcon',
    width: 120,
    formatter: (row: Menu) => row.menuIcon || row.icon || ''
  },
  {
    label: '菜单类型',
    prop: 'menuType',
    width: 100,
    formatter: (row: Menu) => {
      switch (row.menuType) {
        case 1: return '菜单'
        case 2: return '按钮'
        case 3: return '目录'
        default: return '未知'
      }
    }
  },
  {
    label: '权限标识',
    prop: 'perms',
    width: 160,
    formatter: (row: Menu) => row.perms || row.menuCode || ''
  },
  {
    label: '菜单地址',
    prop: 'menuPath',
    width: 120,
    formatter: (row: Menu) => row.menuPath || row.path || ''
  },
  {
    label: '组件路径',
    prop: 'menuComponent',
    width: 100,
    formatter: (row: Menu) => row.menuComponent || row.component || ''
  },
  {
    label: '菜单状态',
    prop: 'menuState',
    width: 100,
    formatter: (row: Menu) => {
      const status = row.menuState
      return status === 0 ? '正常' : '禁用'
    }
  },
  {
    label: '注册时间',
    prop: 'createTime',
    width: 200,
    formatter: (row: Menu) => {
      const time = row.createTime || ''
      // 格式化日期，移除不必要的部分
      if (time) {
        // 保留年月日时分秒，移除毫秒和时区
        return time.replace(/\.\d+Z$/, '').replace('T', ' ')
      }
      return ''
    }
  }
]

/** 状态选项 */
const statusOptions = [
  { label: '正常', value: 0 },
  { label: '禁用', value: 1 }
]

/** 父级菜单选项 */
const parentMenuOptions = ref<Menu[]>([])

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
const DialogRuleForm = reactive<MenuForm>({
  menuId: undefined,
  menuName: '',
  menuType: 1,
  menuIcon: '',
  menuPath: '',
  menuComponent: '',
  parentId: 0,
  sort: 0,
  status: 1,
  perms: ''
})

/** 对话框表单验证规则 */
const DialogRules = {
  menuName: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  menuType: [
    { required: true, message: '请选择菜单类型', trigger: 'change' }
  ]
}

// ==================== 方法定义 ====================

/**
 * 搜索按钮点击事件
 */
const handleSearch = () => {
  getMenuList()
}

/**
 * 重置按钮点击事件
 */
const handleReset = () => {
  menuRuleForm.menuName = ''
  menuRuleForm.status = null
  getMenuList()
}





/**
 * 处理菜单 ID 字段
 * @param menu 菜单对象
 * @returns 处理后的菜单 ID
 */
const getMenuId = (menu: any): string | number => {
  return menu.menuId || menu._id
}

/**
 * 处理菜单 parentId 字段
 * @param menu 菜单对象
 * @returns 处理后的父级 ID
 */
const getParentId = (menu: any): string | number | null => {
  if (Array.isArray(menu.parentId)) {
    return menu.parentId[0] || null
  } else if (menu.parentId !== undefined) {
    // 处理空字符串、空值等情况
    if (menu.parentId === '' || menu.parentId === null || menu.parentId === undefined) {
      return null
    }
    return menu.parentId
  }
  return null
}

/**
 * 构建树形菜单结构
 * @param menuList 菜单列表
 * @returns 树形结构的菜单列表
 */
const buildTreeMenu = (menuList: Menu[]) => {
  const menuMap: Map<string | number, Menu> = new Map()
  const tree: Menu[] = []

  // 第一步：处理所有菜单项，转换字段并存储到 Map
  menuList.forEach(menu => {
    const menuId = getMenuId(menu)
    const processedMenu: Menu = {
      ...menu,
      menuId: menuId,
      parentId: getParentId(menu),
      menuState: menu.menuState !== undefined ? menu.menuState : menu.status,
      children: [],
      hasChildren: false
    }
    menuMap.set(menuId, processedMenu)
  })

  // 第二步：建立父子关系
  menuMap.forEach((menu: Menu) => {
    const parentId = menu.parentId
    if (parentId === 0 || parentId === null) {
      // 根菜单
      tree.push(menu)
    } else {
      // 子菜单，找到父菜单并添加到 children
      const parentMenu = menuMap.get(parentId)
      if (parentMenu) {
        (parentMenu.children as Menu[]).push(menu)
        parentMenu.hasChildren = true
      } else {
        // 父菜单不存在，添加为根菜单
        tree.push(menu)
      }
    }
  })

  return tree
}

/**
 * 获取菜单列表数据
 */
const getMenuList = async () => {
  const params = {
    ...menuRuleForm
  }

  try {
    const res: any = await Api.getMenuList(params)

    // 处理不同的数据结构
    let originalData: Menu[] = []
    if (Array.isArray(res)) {
      // mock 服务返回的结构: data 直接是数组
      originalData = res
    } else if (res.list) {
      // 后端服务返回的结构: data.list 是数组
      originalData = res.list
    }

    // 保存所有数据
    allTableData.value = originalData

    // 根据搜索条件过滤数据
    let filteredData = [...originalData]

    // 按菜单名称过滤
    if (menuRuleForm.menuName) {
      const searchTerm = menuRuleForm.menuName.toLowerCase()
      filteredData = filteredData.filter(item => {
        const menuName = item.menuName?.toLowerCase() || ''
        return menuName.includes(searchTerm)
      })
    }

    // 按菜单状态过滤
    if (menuRuleForm.status !== null) {
      filteredData = filteredData.filter(item =>
        (item.menuState === menuRuleForm.status) || (item.status === menuRuleForm.status)
      )
    }

    // 收集所有匹配菜单项的父菜单 ID
    const parentIds = new Set<string | number>()
    filteredData.forEach(item => {
      if (item.parentId && item.parentId !== 0 && item.parentId !== null) {
        parentIds.add(item.parentId)
      }
    })

    // 添加所有父菜单到过滤后的数据中
    const finalFilteredData = [...filteredData]
    originalData.forEach(item => {
      if (parentIds.has(getMenuId(item))) {
        // 检查是否已经在过滤后的数据中
        const exists = finalFilteredData.some(menu => getMenuId(menu) === getMenuId(item))
        if (!exists) {
          finalFilteredData.push(item)
        }
      }
    })

    // 构建树形结构
    const treeData = buildTreeMenu(finalFilteredData)

    // 更新表格数据
    tableData.value = treeData

    // 更新父级菜单选项（用于级联选择器）
    const buildCascaderOptions = (menuList: Menu[]): any[] => {
      return menuList.map(menu => {
        const option: any = {
          value: menu.menuId,
          label: menu.menuName
        }
        if (menu.children && menu.children.length > 0) {
          option.children = buildCascaderOptions(menu.children)
        }
        return option
      })
    }

    // 包含所有类型的菜单作为父级选项
    parentMenuOptions.value = buildCascaderOptions(treeData)
  } catch (err: any) {
    console.error('Error fetching menu list:', err)
    ElMessage.error(err?.msg || err?.message || '获取菜单列表失败')
  }
}

/**
 * 新增按钮点击事件
 */
const handleAddClick = (parentRow?: Menu) => {
  active.value = 'add'
  dialogTitle.value = '新增菜单'
  // 重置表单
  Object.assign(DialogRuleForm, {
    menuId: undefined,
    menuName: '',
    menuType: 1,
    menuIcon: '',
    menuPath: '',
    menuComponent: '',
    parentId: parentRow ? [parentRow._id || parentRow.menuId] : 0,
    sort: 0,
    status: 0,
    perms: ''
  })
  customDraggingVisible.value = true
}

/**
 * 编辑按钮点击事件
 * @param index 行索引
 * @param row 行数据
 */
// @ts-ignore
const handleEdit = (index: number, row: Menu) => {
  active.value = 'edit'
  dialogTitle.value = '编辑菜单'
  // 填充表单数据
  Object.assign(DialogRuleForm, {
    menuId: row._id,
    menuName: row.menuName,
    menuType: row.menuType,
    menuIcon: row.menuIcon || row.icon || '',
    menuPath: row.menuPath || row.path || '',
    menuComponent: row.menuComponent || row.component || '',
    parentId: row.parentId && row.parentId !== 0 ? [row.parentId] : 0,
    sort: row.sort || 0,
    status: row.status !== undefined ? row.status : (row.menuState !== undefined ? row.menuState : 1),
    perms: row.perms || row.menuCode || ''
  })
  customDraggingVisible.value = true
}

/**
 * 删除按钮点击事件
 * @param _index 行索引
 * @param row 行数据
 */
const handleDelete = (_index: number, row: Menu) => {
  ElMessageBox.confirm('确定删除该菜单吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 使用 _id 作为删除参数，因为后端数据的 ID 字段是 _id
    const menuId = row._id || row.menuId
    // 尝试使用 _id 作为参数字段
    const deleteParams = { _id: menuId }

    Api.deleteMenu(deleteParams).then((res: any) => {
      ElMessage.success(res?.msg || '删除成功')
      getMenuList()
    }).catch((err: any) => {
      ElMessage.error(err?.msg || err?.message || '删除失败')
    })
  }).catch(() => {
    // 取消删除
  })
}



/**
 * 对话框取消按钮点击事件
 */
// @ts-ignore
const handleDialogCancel = () => {
  customDraggingVisible.value = false
}

/**
 * 对话框确认按钮点击事件
 */
const handleDialogConfirm = () => {
  if (active.value === 'add' || active.value === 'edit') {
    // 表单验证
    DialogRuleFormRef.value?.validate((valid, _fields) => {
      if (valid) {
        // 处理父级菜单ID，确保是单一值而不是数组
        const formData: any = {
          ...DialogRuleForm,
          parentId: Array.isArray(DialogRuleForm.parentId)
            ? DialogRuleForm.parentId[DialogRuleForm.parentId.length - 1]
            : DialogRuleForm.parentId,
          menuState: DialogRuleForm.status, // 将 status 转换为 menuState
          action: active.value
        }

        // 移除 status 字段，因为后端使用 menuState
        delete formData.status

        // 如果是编辑操作，将 menuId 转换为 _id
        if (active.value === 'edit' && DialogRuleForm.menuId) {
          formData._id = DialogRuleForm.menuId
          delete formData.menuId
        }

        // 提交表单
        Api.operateMenu(formData).then((res: any) => {
          ElMessage.success(res?.msg || '操作成功')
          customDraggingVisible.value = false
          getMenuList()
        }).catch((err: any) => {
          ElMessage.error(err?.msg || err?.message || '操作失败')
        })
      }
    })
  }
}

// ==================== 生命周期 ====================

/**
 * 组件挂载后获取菜单列表
 */
onMounted(() => {
  getMenuList()
})
</script>

<style scoped lang="scss">
.menu-manager {
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

  .menu-table {
    background: var(--el-bg-color, #ffffff);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 24px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    }

    /* 树形表格样式优化 */
    :deep(.el-table__expand-icon) {
      color: #667eea;
      font-size: 16px;
      transition: transform 0.3s ease;

      &:hover {
        color: #5a6fd8;
      }
    }

    :deep(.el-table__row) {
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--el-fill-color-light, #f5f7fa) !important;
      }

      &.current-row {
        background-color: #e6e9ff !important;
      }
    }

    :deep(.el-table__header th) {
      background-color: var(--el-fill-color-light, #f5f7fa);
      font-weight: 600;
      color: var(--el-text-color-primary, #303133);
      border-bottom: 2px solid var(--el-border-color, #ebeef5);
    }

    :deep(.el-table__body td) {
      border-bottom: 1px solid var(--el-border-color, #ebeef5);
      padding: 12px 16px;
      color: var(--el-text-color-primary, #303133);
    }

    /* 树形表格缩进调整 */
    :deep(.el-table__indent) {
      width: 20px;
    }

    /* 操作按钮样式 */
    .el-button {
      border-radius: 4px;
      font-size: 12px;
      padding: 4px 12px;
      margin-right: 8px;

      &:last-child {
        margin-right: 0;
      }

      &--small {
        padding: 4px 10px;
      }
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

        // 树形表格缩进样式
        .el-table__indent {
          width: 30px;

          .el-table__indent-level {
            width: 30px;
          }
        }

        // 树形表格展开/折叠图标
        .el-table__expand-icon {
          color: #667eea;

          &:hover {
            color: #5366d6;
          }

          .el-icon {
            font-size: 16px;
          }
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
        .el-input-number {
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