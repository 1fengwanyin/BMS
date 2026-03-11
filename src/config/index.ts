const ENV = import.meta.env.MODE || 'pro'
const ENVconfig: interConfig = {
  dev: {
    baseApi: '/api',
    mockApi: 'http://127.0.0.1:4523/m1/5673431-5354191-default/api'
  },
  test: {
    baseApi: '/testapi',
    mockApi: 'http://127.0.0.1:4523/m1/5673431-5354191-default/api'
  },
  pro: {
    baseApi: '/proapi',
  },
}
export default {
  ENV,
  mock: true, // 总开关
  ...ENVconfig[ENV]
}