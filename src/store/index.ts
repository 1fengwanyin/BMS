import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 用户信息接口
interface UserInfo {
  userId?: string | number
  userName?: string
  userEmail?: string
  mobile?: string
  job?: string
  state?: number
  role?: number
  roleList?: string[]
  deptId?: string[]
  token?: string
}

export const useStore = defineStore('user', () => {
  // ==================== State ====================
  // 用户信息
  const userInfo = ref<UserInfo>({})
  // 登录状态
  const isLoggedIn = ref(false)

  // ==================== Getters ====================
  // 获取用户名
  const userName = computed(() => userInfo.value.userName || 'admin')
  // 获取用户邮箱
  const userEmail = computed(() => userInfo.value.userEmail || '2506215277@qq.com')
  // 获取用户手机号
  const userMobile = computed(() => userInfo.value.mobile || '')

  // ==================== Actions ====================
  // 设置用户信息（登录成功后调用）
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = { ...info }
    isLoggedIn.value = true
    // 持久化到 localStorage
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  // 从 localStorage 恢复用户信息
  const restoreUserInfo = () => {
    const stored = localStorage.getItem('userInfo')
    if (stored) {
      try {
        userInfo.value = JSON.parse(stored)
        isLoggedIn.value = true
      } catch (e) {
        console.error('恢复用户信息失败', e)
      }
    }
  }

  // 退出登录
  const logout = () => {
    userInfo.value = {}
    isLoggedIn.value = false
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
  }

  // 初始化时尝试恢复用户信息
  restoreUserInfo()

  return {
    // state
    userInfo,
    isLoggedIn,
    // getters
    userName,
    userEmail,
    userMobile,
    // actions
    setUserInfo,
    restoreUserInfo,
    logout
  }
})