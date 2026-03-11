import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
const app = createApp(App)

// 引入国际化
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 引入 Element Plus 基础样式
import 'element-plus/dist/index.css'

app.use(ElementPlus, {
    locale: zhCn,
})

// 引入 Element Plus 暗黑模式 CSS 变量
import 'element-plus/theme-chalk/dark/css-vars.css'

// 4.1.引入icon图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 3.导入windi样式
import 'virtual:windi.css'

// 1.1. 导入 Pinia 核心方法
import { createPinia } from 'pinia'

// 2.1. 导入路由实例
import router from './router'

// 1.2. 创建 Pinia 实例
const pinia = createPinia()

// 4.2.导入
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 1.3. 挂载 Pinia 到 Vue 应用
// 2.2. 挂载 router 到 Vue 应用
app.use(pinia).use(router).mount('#app')
