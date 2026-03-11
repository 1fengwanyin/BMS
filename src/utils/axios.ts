// Token 无效时的提示信息，用于鉴权失败场景
const TOKEN_INVALID = 'Token认证失败，请重新登录'
// 网络请求异常时的提示信息，用于网络错误或服务端异常场景
const NETWORK_ERROR = '网络请求异常，请稍后重试'
// 导入Element Plus提示组件
import { ElMessage } from 'element-plus'
// 失败时跳转路由
import router from './../router'
// 导入axios核心库
import axios from 'axios'
// 导入项目全局配置
import config from './../config'

// 创建axios实例
const service = axios.create({
    baseURL: config.baseApi || config.mockApi,
    timeout: 6 * 1000,
});

// ========== 请求拦截器 ==========
service.interceptors.request.use((config) => {
    // 在发送请求之前做些处理（如添加token、请求头）
    return config;
}, (error) => {
    // 对请求错误做统一处理
    return Promise.reject(error);
});

// ========== 响应拦截器 ==========
service.interceptors.response.use((res: any) => {
    // 对响应数据做统一处理
    const { data, msg, code } = res.data
    if (code === 200) {
        // 成功：直接返回业务数据
        return data
    } else if (code === 501) {
        // Token失效：提示+跳登录页
        ElMessage({
            message: TOKEN_INVALID,
            type: 'error'
        })
        router.push("/login")
        return Promise.reject(TOKEN_INVALID)
    } else if (code === 401) {
        // 权限/网络异常：统一提示
        ElMessage({
            message: NETWORK_ERROR,
            type: 'error'
        })
        return Promise.reject(NETWORK_ERROR)
    } else {
        // 其他业务错误：返回后端提示信息
        ElMessage({
            message: msg,
            type: 'error'
        })
        return Promise.reject(msg)
    }
}, (error) => {
    // 对响应错误（如网络断连、超时）做统一处理
    return Promise.reject(error);
});

// ========== axios核心请求函数（封装通用请求逻辑） ==========
function request(options: any) {
    // 封装请求：默认GET请求
    options.method = options.method || 'get'

    // GET请求：将传入的data映射为axios的params（适配前端传参习惯）
    if (options.method.toLowerCase() === 'get') {
        options.params = options.data
    }

    // 判断是否使用Mock：优先使用接口自身的mock配置，其次用全局配置
    let isMock = config.mock
    if (typeof options.mock !== 'undefined') {
        isMock = options.mock && config.mock
    }

    // 动态切换baseURL：生产环境固定用正式接口，开发环境根据mock配置切换
    if (config.ENV === 'pro') {
        service.defaults.baseURL = config.baseApi
    } else {
        service.defaults.baseURL = isMock ? config.mockApi : config.baseApi
    }

    // 发起请求并返回Promise
    return service(options)
}

// 导出核心请求函数（项目中统一导入此函数发起请求）
export default request