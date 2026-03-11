import request from "../utils/axios";
export default {
    getMenuList: (params?: any) => request({
        url: '/menu/list',
        method: 'GET',
        mock: false,
        data: params
    }),

    getUserList: (params?: any) => request({
        url: '/users/list',
        method: 'GET',
        mock: false,
        data: params
    }),
    getRoleList: (params?: any) => request({
        url: '/role/list',
        method: 'GET',
        mock: false,
        data: params
    }),
    getDeptList: (params?: any) => request({
        url: '/dept/list',
        method: 'GET',
        mock: false,
        data: params
    }),
    login: (params?: any) => request({
        url: '/users/login',
        method: 'POST',
        mock: false,
        data: params
    }),
    getUserOperateList: (params?: any) => request({
        url: '/users/operate',
        method: 'POST',
        mock: false,
        data: params
    }),
    deleteUser: (params?: any) => request({
        url: '/users/delete',
        method: 'POST',
        mock: false,
        data: params
    }),
    operateMenu: (params?: any) => request({
        url: '/menu/operate',
        method: 'POST',
        mock: false,
        data: params
    }),
    deleteMenu: (params?: any) => request({
        url: '/menu/delete',
        method: 'POST',
        mock: false,
        data: params
    }),
    operateRole: (params?: any) => request({
        url: '/role/operate',
        method: 'POST',
        mock: false,
        data: params
    }),
    deleteRole: (params?: any) => request({
        url: '/role/delete',
        method: 'POST',
        mock: false,
        data: params
    }),
    operateDept: (params?: any) => request({
        url: '/dept/operate',
        method: 'POST',
        mock: false,
        data: params
    }),
    deleteDept: (params?: any) => request({
        url: '/dept/delete',
        method: 'POST',
        mock: false,
        data: params
    }),
    getEchartsData: (params?: any) => request({
        url: '/echarts/data',
        method: 'GET',
        mock: false,
        data: params
    })
}