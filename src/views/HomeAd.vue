<template>
  <!-- 
    主页面内容
    使用 el-dark 类名控制暗黑模式样式
    Element Plus 会自动应用--el-bg-color 等变量
  -->
  <div class="homeBg" :class="{ 'dark': isDark }">
    <div class="common-layout">
      <el-container>
        <!-- ==================== 侧边栏区域 ==================== -->
        <el-aside width="180px" class="sidebar" :style="{ width: collapseSubmenu ? '50px' : '180px' }">
          <!-- 展开状态的Logo区域 -->
          <div class="sidebar-header" v-show="!collapseSubmenu" @click="goToWelcome">
            <h3 style="cursor: pointer;">
              <img :src="logoImg" alt="logo" class="logo-img" />
              课工场后台管理
            </h3>
          </div>

          <!-- 折叠状态的Logo区域 -->
          <div class="sidebar-header-mini" v-show="collapseSubmenu" @click="goToWelcome">
            <img :src="logoImg" alt="logo" class="logo-img-mini" style="cursor: pointer;" />
          </div>

          <!-- 侧边栏菜单-->
          <el-menu :collapse="collapseSubmenu" :active-text-color="color1" background-color="#000" class="sidebar-menu"
            :default-active="$route.path" text-color="#ecf0f1" @open="handleOpen" @close="handleClose" unique-opened>
            <!-- 递归渲染菜单组件 -->
            <TreeMenu :userMenu="userMenu" @menu-click="handleMenuClick"></TreeMenu>
          </el-menu>
        </el-aside>

        <!-- ==================== 主内容区域 ==================== -->
        <el-container>
          <!-- 顶部导航栏-->
          <el-header class="main-header">
            <div class="header-content">
              <!-- 左侧：菜单折叠按钮-->
              <div class="left-content">
                <div>
                  <el-icon class="menu-icon cursor-pointer" @click="collapseSubmenu = !collapseSubmenu">
                    <Fold v-if="!collapseSubmenu" />
                    <Expand v-else />
                  </el-icon>
                </div>
              </div>

              <!-- 右侧：功能按钮区域-->
              <div class="user-info">
                <!-- 刷新按钮 - 带旋转动画-->
                <el-icon :class="Rotate ? 'animata-span' : ''" @click="changeRotate">
                  <Refresh />
                </el-icon>

                <!-- 全屏切换按钮 -->
                <el-icon @click="changeFullScreen">
                  <Aim v-if="isFullScreen" />
                  <FullScreen v-else />
                </el-icon>

                <!-- 主题切换开关- 使用 VueUse 的 useDark -->
                <el-switch v-model="isDark" :active-action-icon="Moon" :inactive-action-icon="Sunny"
                  style="--el-switch-on-color: #000; --el-switch-off-color: #999;" @change="toggleDark" />

                <!-- 通知图标 - 带红点提醒-->
                <el-badge is-dot class="item">
                  <el-icon>
                    <Bell />
                  </el-icon>
                </el-badge>

                <!-- 用户下拉菜单 -->
                <el-dropdown>
                  <span class="el-dropdown-link">
                    {{ userName }}
                    <el-icon class="el-icon-right">
                      <ArrowDown />
                    </el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>邮箱:{{ userEmail }}</el-dropdown-item>
                      <el-dropdown-item @click="drawer2 = true">设置</el-dropdown-item>
                      <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </el-header>

          <!-- Tab 标签页区域-->
          <div class="tabs-container">
            <el-tabs v-model="editableTabsValue" type="card" class="demo-tabs" @tab-remove="handleTabRemove"
              @tab-click="handleTabClick">
              <el-tab-pane v-for="item in editableTabs" :key="item.name" :label="item.title" :name="item.name"
                :closable="item.closable">
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 页面内容区域 - 路由视图 -->
          <el-main class="main-content">
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </div>

    <!-- ==================== 抽屉组件 ==================== -->
    <!-- 抽屉1 - 示例抽屉 -->
    <el-drawer v-model="drawer" title="I am the title" :direction="direction" :before-close="handleCloseDrawer">
      <span>Hi, there!</span>
    </el-drawer>

    <!-- 抽屉2 - 主题设置抽屉 -->
    <el-drawer v-model="drawer2" :direction="direction">
      <template #header>
        <h4>主题</h4>
      </template>
      <template #default>
        <div class="demo-color-block">
          <span class="demonstration">请选择</span>
          <el-color-picker v-model="color1" @change="colorChange" />
        </div>
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="cancelClick">取消</el-button>
          <el-button type="primary" @click="confirmClick">确认</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
/**
 * HomeAd.vue - 后台管理系统主布局组件
 * 
 * 功能说明：
 * 1. 提供侧边栏导航菜单（支持三级菜单）
 * 2. 顶部工具栏（刷新、全屏、主题切换、用户菜单）
 * 3. 暗黑模式切换
 * 4. 响应式布局
 */

// ==================== 导入依赖 ====================

// API 模块 - 用于获取菜单数据
import Api from './../api'

// 递归菜单组件 - 用于渲染多级菜单
import TreeMenu from './../components/TreeMenu.vue'

// Logo 图片资源
import logoImg from '../assets/logo.png'

// Vue 响应式 API
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// Sortable 拖拽�?
import Sortable from 'sortablejs'

// Vue 路由模块 - 用于页面跳转
import router from './../router'

// Element Plus 图标组件
import {
  Fold,        // 折叠图标
  Expand,      // 展开图标
  Refresh,     // 刷新图标
  FullScreen,  // 全屏图标
  Aim,         // 退出全屏图�?
  Sunny,       // 太阳图标（亮色模式）
  Moon,        // 月亮图标（暗色模式）
  Bell,        // 铃铛图标（通知�?
  ArrowDown    // 向下箭头图标
} from '@element-plus/icons-vue'

// VueUse 暗黑模式相关函数
import { useDark, useToggle } from '@vueuse/core'

// Element Plus 消息框组�?
import { ElMessageBox } from 'element-plus'

// Pinia store
import { useStore } from './../store'
import { storeToRefs } from 'pinia'

// 初始�?store
const store = useStore()
const { userName, userEmail } = storeToRefs(store)

// 测试日志
const logout = () => {
  store.logout()
  router.push('/login')
  // ElMessageBox.confirm(
  //   '提示',                     // 标题
  //   `您确定要退出登录吗？`,  // 消息内容
  //   {
  //     confirmButtonText: '确认',  // 确认按钮文字
  //     cancelButtonText: '取消',   // 取消按钮文字
  //     type: 'warning',            // 消息类型（显示警告图标）
  //     center: true,               // 内容居中
  //     customClass: 'centered-message-box'  // 自定义样式类
  //   }
  // )
  //   .then(() => {
  //     // 用户点击确认 - 退出登�?
  //     //     // 清除 localStorage 中的 token
  //     localStorage.removeItem('token')
  //     // 跳转到登录页
  //     router.push('/login')
  //   })
  //   .catch(() => {
  //     // 用户点击取消 - 不做任何操作
  //   })
}


// ==================== 抽屉相关状�?====================

/** 抽屉1显示状�?*/
const drawer = ref(false)

/** 抽屉2（主题设置）显示状�?*/
const drawer2 = ref(false)

/** 抽屉打开方向 - rtl 表示从右向左 */
const direction = ref('rtl')

/**
 * 抽屉关闭前的处理函数
 * @param done 关闭回调函数
 */
const handleCloseDrawer = (done: () => void) => {
  done()
}

/**
 * 取消按钮点击事件 - 关闭抽屉2
 */
const cancelClick = () => {
  drawer2.value = false
}

/**
 * 确认按钮点击事件 - 显示确认对话�?
 */
const confirmClick = () => {
  ElMessageBox.confirm(
    '提示',                     // 标题
    `您确定要应用配置吗？`,  // 消息内容
    {
      confirmButtonText: '确认',  // 确认按钮文字
      cancelButtonText: '取消',   // 取消按钮文字
      type: 'warning',            // 消息类型（显示警告图标）
      center: true,               // 内容居中
      customClass: 'centered-message-box'  // 自定义样式类
    }
  )
    .then(() => {
      // 用户点击确认 - 应用颜色并关闭抽�?
      // 保存颜色�?localStorage，实现持久化
      localStorage.setItem('themeColor', color1.value)
      // 设置 Element Plus 主题�?CSS 变量
      const el = document.documentElement
      el.style.setProperty('--el-color-primary', color1.value)
      drawer2.value = false
    })
    .catch(() => {
      // 用户点击取消 - 不做任何操作
    })
}

/**
 * 颜色改变事件 - 实时预览主题�?
 * @param e 选择的颜色�?
 */
const colorChange = (e: string) => {
  const el = document.documentElement
  el.style.setProperty('--el-color-primary', e)
}

// ==================== 暗黑模式 ====================

/** 暗黑模式状�?- true 为暗色，false 为亮�?*/
const isDark = useDark()

/** 切换暗黑模式函数 */
const toggleDark = useToggle(isDark)

// ==================== 响应式数�?====================

/** 菜单数据 - �?API 获取 */
const userMenu = ref<any[]>([])

/**
 * 将扁平的菜单数据转换为树形结�?
 * @param menuList 扁平的菜单数�?
 * @returns 树形结构的菜单数�?
 */
const buildMenuTree = (menuList: any[]) => {
  const menuMap: Map<string, any> = new Map()
  const result: any[] = []

  // 第一步：将所有菜单项存入 Map，并初始�?children 数组
  menuList.forEach(item => {
    menuMap.set(item._id, {
      ...item,
      children: []
    })
  })

  // 第二步：根据 parentId 建立父子关系
  menuList.forEach(item => {
    const menuItem = menuMap.get(item._id)

    // 如果 parentId 不存在、为空或 null，说明是一级菜�?
    if (!item.parentId) {
      result.push(menuItem)
    } else {
      // 否则找到父菜单，将当前菜单添加到父菜单的 children �?
      const parentMenu = menuMap.get(item.parentId)
      if (parentMenu) {
        parentMenu.children.push(menuItem)
      } else {
        // 如果找不到父菜单，说�?parentId 无效，作为一级菜单处�?
        result.push(menuItem)
      }
    }
  })

  return result
}

/** 侧边栏折叠状�?- true 为折叠，false 为展开 */
const collapseSubmenu = ref(false)

/** 刷新按钮旋转状�?- 用于控制动画 */
const Rotate = ref(false)

/** 全屏状�?- true 为全屏，false 为窗口模�?*/
const isFullScreen = ref(false)

/** 颜色选择器�?- �?localStorage 读取，默认值为 #409EFF */
const color1 = ref(localStorage.getItem('themeColor') || '#409EFF')

// ==================== Tab 标签页相�?====================

/** Tab 索引计数�?*/
let tabIndex = 2

/** 当前激活的 Tab */
const editableTabsValue = ref('2')

/** Tab 列表 */
const editableTabs = ref([
  {
    title: '首页',
    name: '1',
    path: '/welcome',
    closable: false
  },
  {
    title: '用户管理',
    name: '2',
    path: '/user',
    closable: true
  }
])

/**
 * 添加 Tab
 * @param title Tab 标题
 * @param path 路由路径
 */
const addTab = (title: string, path: string) => {
  // 检查是否已存在该路径的 Tab
  const existingTab = editableTabs.value.find(tab => tab.path === path)
  if (existingTab) {
    // 如果已存在，切换到该 Tab
    editableTabsValue.value = existingTab.name
    router.push(path)
    return
  }

  // 创建�?Tab
  const newTabName = `${++tabIndex}`
  editableTabs.value.push({
    title,
    name: newTabName,
    path,
    closable: true
  })
  editableTabsValue.value = newTabName
  router.push(path)
}

/**
 * 移除 Tab
 * @param targetName 要移除的 Tab 名称
 */
const handleTabRemove = (targetName: string) => {
  const tabs = editableTabs.value
  let activeName = editableTabsValue.value

  // 如果关闭的是当前激活的 Tab，需要切换到其他 Tab
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }

  // 更新激活的 Tab
  editableTabsValue.value = activeName

  // 移除 Tab
  editableTabs.value = tabs.filter((tab) => tab.name !== targetName)

  // 跳转到新的激�?Tab 对应的路�?
  const activeTab = editableTabs.value.find(tab => tab.name === activeName)
  if (activeTab) {
    router.push(activeTab.path)
  }
}

/**
 * 点击菜单添加 Tab
 * @param menuItem 菜单�?
 */
const handleMenuClick = (menuItem: any) => {
  if (menuItem.path) {
    addTab(menuItem.menuName || menuItem.title, menuItem.path)
  }
}

/**
 * 点击 Tab 切换路由
 * @param tab Tab 对象
 */
const handleTabClick = (tab: any) => {
  const clickedTab = editableTabs.value.find(item => item.name === tab.props.name)
  if (clickedTab && clickedTab.path) {
    router.push(clickedTab.path)
  }
}

// ==================== Tab 拖拽功能 ====================

/** Sortable 实例 */
let sortableInstance: Sortable | null = null

/**
 * 初始�?Tab 拖拽功能
 */
const initTabSortable = () => {
  nextTick(() => {
    const tabsNav = document.querySelector('.demo-tabs .el-tabs__nav') as HTMLElement
    if (!tabsNav) return

    sortableInstance = new Sortable(tabsNav, {
      animation: 150,
      draggable: '.el-tabs__item',
      onEnd: (evt: any) => {
        const { oldIndex, newIndex } = evt
        if (oldIndex === newIndex || oldIndex === undefined || newIndex === undefined) return

        // 更新 Tab 顺序
        const tabs = [...editableTabs.value]
        const movedTab = tabs.splice(oldIndex, 1)[0]
        if (movedTab) {
          tabs.splice(newIndex, 0, movedTab)
          editableTabs.value = tabs
        }
      }
    })
  })
}

/**
 * 销�?Sortable 实例
 */
const destroyTabSortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

// ==================== 事件处理函数 ====================

/**
 * 菜单展开事件
 * @param key 当前菜单�?key
 * @param keyPath 菜单�?key 路径数组
 */
const handleOpen = (key: string, keyPath: string[]) => {
}

/**
 * 菜单收起事件
 * @param key 当前菜单�?key
 * @param keyPath 菜单�?key 路径数组
 */
const handleClose = (key: string, keyPath: string[]) => {
}

/**
 * 刷新页面
 * 触发旋转动画后刷新页�?
 */
const changeRotate = () => {
  Rotate.value = !Rotate.value
  window.location.reload()
}

/**
 * 切换全屏模式
 * 使用 Fullscreen API 实现
 */
const changeFullScreen = () => {
  isFullScreen.value = !isFullScreen.value
  if (isFullScreen.value) {
    // 进入全屏
    document.documentElement.requestFullscreen()
  } else {
    // 退出全�?
    document.exitFullscreen()
  }
}

/**
 * 跳转到欢迎页�?
 */
const goToWelcome = () => {
  router.push('/welcome')
}

/**
 * 获取菜单列表数据
 * 从后�?API 获取菜单数据并赋值给 userMenu
 */
const getMenuList = () => {
  Api.getMenuList().then((res: any) => {
    // 处理后端数据结构：后端返�?{ list: [...] }
    if (res && res.list) {
      // 统计不同 menuType 的数�?
      const menuTypeCount: Record<number, number> = {}
      res.list.forEach((item: any) => {
        const type = item.menuType || 0
        menuTypeCount[type] = (menuTypeCount[type] || 0) + 1
      })
      // 不过�?menuType，包含所有类型的菜单
      const menuList = res.list
      // 将扁平数据转换为树形结构
      const menuTree = buildMenuTree(menuList)
      userMenu.value = menuTree
    } else {
      userMenu.value = []
    }
  }).catch((error: any) => {
    userMenu.value = []
  })
}

/* ==================== 全局主题色设�?==================== */

/**
 * 初始化主题色 - 页面加载时应用保存的主题�?
 */
const initThemeColor = () => {
  const savedColor = localStorage.getItem('themeColor')
  if (savedColor) {
    document.documentElement.style.setProperty('--el-color-primary', savedColor)
  }
}

/* 页面加载时初始化主题�?*/
initThemeColor()

// ==================== 初始�?====================

/** 组件挂载时获取菜单数�?*/
getMenuList()

/** 组件挂载时初始化 Tab 拖拽 */
onMounted(() => {
  initTabSortable()
})

/** 组件卸载时销�?Tab 拖拽 */
onUnmounted(() => {
  destroyTabSortable()
})
</script>

<style scoped lang="scss">
// ==================== 页面基础样式 ====================

/**
 * 主页面背景容�?
 * 使用 Element Plus CSS 变量实现主题切换
 * --el-bg-color: 背景�?
 * --el-bg-color-page: 页面背景�?
 * --el-text-color-primary: 主要文字颜色
 * --el-text-color-regular: 常规文字颜色
 * --el-border-color: 边框颜色
 */
.homeBg {
  background-color: var(--el-bg-color-page, #f5f7fa);
  height: 100vh;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;

  // 暗黑模式样式 - 使用 Element Plus 变量
  &.dark {
    // Element Plus 会自动设置这些变�?
    // --el-bg-color: #141414
    // --el-bg-color-page: #0a0a0a
    // --el-text-color-primary: #e0e0e0
    // --el-text-color-regular: #b0b0b0

    .main-header {
      background-color: var(--el-bg-color, #141414);
      color: var(--el-text-color-primary, #e0e0e0);
      border-bottom: 1px solid var(--el-border-color, #303030);

      .header-content {
        h2 {
          color: var(--el-text-color-primary, #e0e0e0);
        }

        .user-info {
          .el-icon {
            color: var(--el-text-color-regular, #b0b0b0);

            &:hover {
              color: var(--el-color-primary, #409EFF);
            }
          }

          .el-dropdown-link {
            color: var(--el-text-color-primary, #e0e0e0);

            &:hover {
              color: var(--el-color-primary, #409EFF);
            }
          }
        }
      }
    }

    .main-content {
      background-color: var(--el-bg-color-page, #0a0a0a);
      color: var(--el-text-color-primary, #e0e0e0);

      &::-webkit-scrollbar-track {
        background: var(--el-bg-color, #141414);
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color, #303030);
      }

      &::-webkit-scrollbar-thumb:hover {
        background: var(--el-text-color-secondary, #606060);
      }
    }

    // 侧边栏暗黑模�?
    .sidebar {
      background-color: var(--el-bg-color, #141414);
      border-right: 1px solid var(--el-border-color, #303030);

      .sidebar-header,
      .sidebar-header-mini {
        background-color: var(--el-bg-color, #141414);
        border-bottom: 1px solid var(--el-border-color, #303030);

        h3 {
          color: var(--el-text-color-primary, #e0e0e0);
        }
      }

      // Element Plus 菜单暗黑模式
      .sidebar-menu {
        background-color: var(--el-bg-color, #141414);

        :deep(.el-menu) {
          background-color: var(--el-bg-color, #141414);
        }

        :deep(.el-sub-menu__title) {
          color: var(--el-text-color-primary, #e0e0e0);

          &:hover {
            background-color: var(--el-fill-color-light, #1f1f1f);
          }
        }

        :deep(.el-menu-item) {
          color: var(--el-text-color-primary, #e0e0e0);

          &:hover {
            background-color: var(--el-fill-color-light, #1f1f1f);
          }

          &.is-active {
            background-color: var(--el-color-primary-light-9, #18222c);
          }
        }
      }
    }
  }
}

// 通用布局容器
.common-layout {
  height: 100vh;
  overflow: hidden;
}

// Element 容器高度设置
.el-container {
  height: 100vh;
}

// ==================== 侧边栏样�?====================

/**
 * 侧边栏容�?
 * 黑色背景，支持折叠展开动画
 */
.sidebar {
  background-color: #000;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  }
}

/**
 * 展开状态的 Logo 区域
 * 显示完整 Logo 和系统名�?
 */
.sidebar-header {
  padding: 20px 0;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;

  h3 {
    color: #ffffff;
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .logo-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
    background-color: #ffffff;
    border-radius: 4px;
    padding: 2px;
  }
}

/**
 * 折叠状态的 Logo 区域
 * 只显�?Logo 图标
 */
.sidebar-header-mini {
  padding: 15px 0;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;

  .logo-img-mini {
    width: 24px;
    height: 24px;
    object-fit: contain;
    background-color: #ffffff;
    border-radius: 4px;
    padding: 2px;
  }
}

/**
 * 侧边栏菜单样�?
 * 黑色背景，白色文字，悬停和激活状态有紫色高亮
 */
.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.3s ease;

  // 隐藏滚动�?
  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;

  // 菜单项样�?
  .el-menu-item {
    height: 48px;
    line-height: 48px;
    margin: 4px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    display: flex;
    align-items: center;

    &:hover {
      background-color: rgba(102, 126, 234, 0.25);
      color: #ffffff;
    }

    &.is-active {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(102, 126, 234, 0.2));
      color: #667eea;
      font-weight: 500;
    }
  }

  // 子菜单标题样�?
  .el-sub-menu {
    .el-sub-menu__title {
      height: 48px;
      line-height: 48px;
      margin: 4px 12px;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
      color: rgba(255, 255, 255, 0.85);
      display: flex;
      align-items: center;

      &:hover {
        background-color: rgba(102, 126, 234, 0.25);
        color: #ffffff;
      }

      // 隐藏子菜单右侧箭头图�?
      .el-sub-menu__icon-arrow {
        display: none !important;
      }
    }
  }

  // 菜单图标样式
  .menu-icon {
    font-size: 18px;
    margin-right: 12px;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
  }

  // 子菜单图标样�?
  .sub-menu-icon {
    font-size: 16px;
    margin-right: 8px;
    color: rgba(255, 255, 255, 0.8);
  }

  // 菜单项中的图标样�?
  :deep(.el-menu-item .el-icon),
  :deep(.el-sub-menu__title .el-icon) {
    font-size: 16px;
    margin-right: 10px;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
  }

  :deep(.el-menu-item:hover .el-icon),
  :deep(.el-sub-menu__title:hover .el-icon) {
    color: #ffffff;
  }

  :deep(.el-menu-item.is-active .el-icon) {
    color: #667eea;
  }

  // 菜单分组标题样式
  .el-menu-item-group__title {
    padding: 12px 20px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  // 禁用菜单项样�?
  .el-menu-item.is-disabled {
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;

    &:hover {
      color: rgba(255, 255, 255, 0.4);
      background-color: rgba(255, 255, 255, 0.08);
    }

    :deep(.el-icon) {
      color: rgba(255, 255, 255, 0.3);
    }
  }
}

// 展开状态的菜单宽度
.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

// 子菜单样�?
:deep(.el-sub-menu .el-menu) {
  background-color: transparent !important;
  padding-left: 8px;
}

// 子菜单项样式
:deep(.el-sub-menu .el-menu-item) {
  height: 40px;
  line-height: 40px;
  font-size: 13px;
  margin: 2px 8px;
  border-radius: 6px;
}

// 子菜单图标样�?
:deep(.el-sub-menu .el-menu-item .el-icon) {
  font-size: 14px;
  margin-right: 8px;
}

// ==================== 顶部导航栏样�?====================

/**
 * 顶部导航�?
 * 白色背景，阴影效果，包含左侧折叠按钮和右侧功能按�?
 */
.main-header {
  background-color: #ffffff;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    // 左侧内容区域
    .left-content {
      display: flex;
      align-items: center;
      gap: 20px;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
      }

      // 菜单折叠按钮
      .menu-icon {
        font-size: 20px;
        cursor: pointer;
        transition: color 0.3s ease;

        &:hover {
          color: #667eea;
          transform: rotate(360deg);
        }
      }
    }

    // 右侧功能按钮区域
    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;

      // 图标按钮通用样式
      .el-icon {
        font-size: 18px;
        cursor: pointer;
        color: #666;
        transition: all 0.3s ease;

        &:hover {
          color: #667eea;
        }
      }

      // 通知图标
      .item {
        display: flex;
        align-items: center;
      }

      // 下拉菜单链接
      .el-dropdown-link {
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        color: #333;
        font-size: 14px;
        font-weight: 500;

        &:hover {
          color: #667eea;
        }

        .el-icon-right {
          font-size: 14px;
          transition: transform 0.3s ease;
        }

        &:hover .el-icon-right {
          transform: rotate(180deg);
        }
      }

      // 下拉菜单�?
      .el-dropdown-menu {
        min-width: 200px;

        .el-dropdown-item {
          font-size: 14px;
          padding: 8px 16px;

          &:hover {
            background-color: #f5f7fa;
            color: #667eea;
          }
        }
      }
    }
  }
}

// ==================== Tab 标签页样�?====================

/**
 * Tab 标签页容�?
 */
.tabs-container {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 20px;

  .demo-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
      border-bottom: none;
    }

    :deep(.el-tabs__nav) {
      border: none;
    }

    :deep(.el-tabs__item) {
      height: 40px;
      line-height: 40px;
      padding: 0 20px;
      border: 1px solid #e0e0e0;
      border-bottom: none;
      margin-right: 4px;
      background-color: #fafafa;
      transition: all 0.3s ease;

      &:hover {
        color: #667eea;
        background-color: #f0f0f0;
      }

      &.is-active {
        background-color: #ffffff;
        border-bottom: 1px solid #ffffff;
        color: #667eea;
        font-weight: 500;
      }
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-icon-close) {
      margin-left: 8px;

      &:hover {
        background-color: #ff4d4f;
        color: #ffffff;
        border-radius: 50%;
      }
    }

    // 拖拽时的样式
    :deep(.sortable-ghost) {
      opacity: 0.4;
      background-color: #f0f0f0;
      border: 2px dashed #667eea;
    }

    :deep(.sortable-drag) {
      opacity: 0.8;
      background-color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: scale(1.02);
    }
  }
}

// 暗黑模式下的 Tab 样式
.dark {
  .tabs-container {
    background-color: var(--el-bg-color, #141414);
    border-bottom-color: var(--el-border-color, #303030);

    .demo-tabs {
      :deep(.el-tabs__item) {
        background-color: var(--el-fill-color-light, #1f1f1f);
        border-color: var(--el-border-color, #303030);
        color: var(--el-text-color-regular, #b0b0b0);

        &:hover {
          color: #667eea;
          background-color: var(--el-fill-color, #262626);
        }

        &.is-active {
          background-color: var(--el-bg-color, #141414);
          border-bottom-color: var(--el-bg-color, #141414);
          color: #667eea;
        }
      }

      // 暗黑模式下拖拽时的样�?
      :deep(.sortable-ghost) {
        opacity: 0.4;
        background-color: var(--el-fill-color-light, #1f1f1f);
        border: 2px dashed #667eea;
      }

      :deep(.sortable-drag) {
        opacity: 0.8;
        background-color: var(--el-bg-color, #141414);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// ==================== 主内容区域样�?====================

/**
 * 主内容区�?
 * 浅灰色背景，自定义滚动条样式
 */
.main-content {
  background-color: #f5f7fa;
  color: #333;
  padding: 20px;
  overflow-y: auto;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
}

// ==================== 动画效果 ====================

/**
 * 旋转动画�?
 * 用于刷新按钮的旋转效�?
 */
.animata-span {
  animation: rotate 1s linear infinite;
}

// 旋转动画关键�?
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// ==================== 响应式布局 ====================

/**
 * 移动端适配
 * 屏幕宽度小于 768px 时的样式调整
 */
@media (max-width: 768px) {
  .sidebar {
    width: 160px !important;
  }

  .sidebar-header h3 {
    font-size: 16px;
  }

  .sidebar-menu .el-menu-item {
    font-size: 14px;
  }

  .sidebar-menu .menu-icon {
    font-size: 16px;
    margin-right: 8px;
  }

  .main-header h2 {
    font-size: 16px;
  }

  .main-content {
    padding: 10px;
  }
}

// 通知徽标样式
.item {
  margin-top: 10px;
  margin-right: 10px;
}

// ==================== 颜色选择器样�?====================

/**
 * 颜色选择器容器样�?
 * 用于主题设置抽屉中的颜色选择�?
 */
.demo-color-block {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;

  .demonstration {
    font-size: 14px;
    color: #666;
    font-weight: 500;
    min-width: 80px;
  }

  // 颜色选择器样�?
  :deep(.el-color-picker) {
    .el-color-picker__trigger {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 2px solid #e0e0e0;
      transition: all 0.3s ease;

      &:hover {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }
  }
}

// 暗黑模式下的颜色选择器样�?
.dark-mode {
  .demo-color-block {
    border-bottom-color: #404040;

    .demonstration {
      color: #b0b0b0;
    }

    :deep(.el-color-picker) {
      .el-color-picker__trigger {
        border-color: #404040;

        &:hover {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
      }
    }
  }
}
</style>

<!-- ==================== 全局样式 ==================== -->
<!-- 用于覆盖 Element Plus 默认样式 -->
<style>
/* -------------------- MessageBox 居中样式 -------------------- */

/**
 * 居中消息框容�?
 * 使用 fixed 定位确保在视口中�?
 */
.centered-message-box {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  min-width: 420px !important;
  padding: 20px !important;
  background-color: #f5f5f5 !important;
}

/**
 * 消息框头�?
 * Flex 布局确保标题和关闭按钮在同一�?
 */
.centered-message-box .el-message-box__header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 0 !important;
  border-bottom: 1px solid #e0e0e0 !important;
}

/**
 * 消息框标�?
 */
.centered-message-box .el-message-box__title {
  display: flex !important;
  align-items: center !important;
  color: #333 !important;
  font-size: 16px !important;
  font-weight: 600 !important;
}

/**
 * 关闭按钮
 * 移除绝对定位，使�?Flex 布局
 */
.centered-message-box .el-message-box__headerbtn {
  position: static !important;
  top: auto !important;
  right: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 4px !important;
  transition: background-color 0.3s !important;
}

.centered-message-box .el-message-box__headerbtn:hover {
  background-color: #e0e0e0 !important;
}

.centered-message-box .el-message-box__headerbtn .el-message-box__close {
  color: #666 !important;
  font-size: 16px !important;
}

.centered-message-box .el-message-box__headerbtn:hover .el-message-box__close {
  color: #333 !important;
}

/**
 * 消息框内容区�?
 */
.centered-message-box .el-message-box__content {
  display: block !important;
  padding: 20px 0 !important;
}

/**
 * 消息框按钮区�?
 * Flex 布局，按钮居中排�?
 */
.centered-message-box .el-message-box__btns {
  display: flex !important;
  justify-content: center !important;
  gap: 10px !important;
  padding-top: 15px !important;
}

/**
 * 消息框按�?
 * 确保按钮可见
 */
.centered-message-box .el-message-box__btns .el-button {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* -------------------- 暗黑模式下的 MessageBox 样式 -------------------- */

.dark .centered-message-box {
  background-color: var(--el-bg-color, #141414) !important;
  border-color: var(--el-border-color, #303030) !important;
}

.dark .centered-message-box .el-message-box__header {
  border-bottom-color: var(--el-border-color, #303030) !important;
}

.dark .centered-message-box .el-message-box__title {
  color: var(--el-text-color-primary, #e0e0e0) !important;
}

.dark .centered-message-box .el-message-box__headerbtn:hover {
  background-color: var(--el-fill-color-light, #1f1f1f) !important;
}

.dark .centered-message-box .el-message-box__headerbtn .el-message-box__close {
  color: var(--el-text-color-secondary, #606060) !important;
}

.dark .centered-message-box .el-message-box__headerbtn:hover .el-message-box__close {
  color: var(--el-text-color-primary, #e0e0e0) !important;
}

.dark .centered-message-box .el-message-box__message {
  color: var(--el-text-color-regular, #b0b0b0);
}

.dark .centered-message-box .el-message-box__btns .el-button {
  background-color: var(--el-fill-color-light, #1f1f1f);
  border-color: var(--el-border-color, #303030);
  color: var(--el-text-color-primary, #e0e0e0);
}

.dark .centered-message-box .el-message-box__btns .el-button.el-button--primary {
  background-color: var(--el-color-primary, #409EFF);
  border-color: var(--el-color-primary, #409EFF);
}

.demo-color-block {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.demo-color-block .demonstration {
  margin-right: 16px;
}

:deep(:focus-visible) {
  outline: none;
}
</style>
