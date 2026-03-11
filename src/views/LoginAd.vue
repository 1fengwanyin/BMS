<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>后台管理系统</h2>
          <p>请登录您的账号</p>
        </div>
      </template>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
        <el-form-item label="账号" prop="userName">
          <el-input v-model="ruleForm.userName" placeholder="请输入账号" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码" prop="userPwd">
          <el-input v-model="ruleForm.userPwd" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(ruleFormRef)" class="login-btn">
            登录
          </el-button>
          <el-button @click="resetForm(ruleFormRef)" class="reset-btn">重置</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="card-footer">
          <p class="text-gray-400">© 2026 后台管理系统</p>
        </div>
      </template>
    </el-card>
    <div class="wave">
      <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g class="parallax">
          <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
          <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
          <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
          <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Api from './../api'
import { useStore } from './../store'

const router = useRouter()
const store = useStore()
interface interLoginRuleForm {
  userName: string
  userPwd: string
}

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<interLoginRuleForm>({
  userName: 'admin',
  userPwd: '123456',
})
const rules = reactive<FormRules<interLoginRuleForm>>({
  userName: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 2, max: 10, message: '账号长度在2-10之间', trigger: 'blur' },
  ],
  userPwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度在6-16之间', trigger: 'blur' },
  ],
})
// 确定登录
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      Api.login(ruleForm).then((res: any) => {
        console.log('登录成功，返回数据:', res)
        ElMessage.success('登录成功')
        // 保存 token
        if (res.token) {
          localStorage.setItem('token', res.token)
        }
        // 保存用户信息到 Pinia store
        store.setUserInfo({
          userId: res.userId || res.user?.userId,
          userName: res.userName || res.user?.userName || ruleForm.userName,
          userEmail: res.userEmail || res.user?.userEmail,
          mobile: res.mobile || res.user?.mobile,
          job: res.job || res.user?.job,
          state: res.state || res.user?.state,
          role: res.role || res.user?.role,
          roleList: res.roleList || res.user?.roleList,
          deptId: res.deptId || res.user?.deptId,
          token: res.token
        })
        console.log('store 中的用户信息:', store.userInfo)
        router.push('/welcome')
      }).catch((err) => {
        console.error('登录失败，错误信息:', err)
      })
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}
// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>
<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: bgGradient 15s ease infinite;
  background-size: 200% 200%;
}

@keyframes bgGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.login-card {
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    transform: translateY(-5px);
  }

  // 统一Card样式
  .el-card__header {
    padding: 0;
    border-bottom: none;
  }

  .el-card__body {
    padding: 0;
  }

  .el-card__footer {
    padding: 0;
    border-top: 1px solid #f0f0f0;
  }
}

.card-header {
  text-align: center;
  padding: 30px 0;

  h2 {
    color: #333;
    font-size: 24px;
    margin-bottom: 10px;
    font-weight: 600;
  }

  p {
    color: #666;
    font-size: 14px;
    margin: 0;
  }
}

.card-footer {
  text-align: center;
  padding: 20px 0;

  p {
    font-size: 12px;
    margin: 0;
  }
}

.el-form {
  width: 100%;
  padding: 0 40px 40px;
}

.el-form-item {
  margin-bottom: 20px;

  .el-form-item__label {
    color: #333;
    font-weight: 500;
  }

  // 按钮容器样式
  .el-form-item__content {
    display: flex;
    gap: 10px;
  }
}

.el-input {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  height: 40px;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }

  .el-input__inner {
    border-radius: 8px;
  }
}

.login-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.reset-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-card {
    max-width: 100%;
  }

  .card-header h2 {
    font-size: 20px;
  }

  .el-form {
    padding: 0 20px 30px;
  }

  .card-header {
    padding: 20px 0;
  }

  .card-footer {
    padding: 15px 0;
  }
}

// 水波纹效果
.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh;
  min-height: 100px;
  max-height: 150px;
  overflow: hidden;
  z-index: 1;
}

.waves {
  position: relative;
  width: 100%;
  height: 100%;
  transform: translateZ(0);
}

.parallax>use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.parallax>use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}

.parallax>use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}

.parallax>use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}

.parallax>use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }

  100% {
    transform: translate3d(85px, 0, 0);
  }
}

// 确保路径正确
#gentle-wave {
  d: path('M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z');
}
</style>
