interface interA {
    [props: string]: string | number
}

interface interConfig {
    [key: string]: interDev
}

interface interDev {
    baseApi: string,
    mockApi?: string
}

interface interLoginRuleForm {
    userName: string
    userPwd: string
}

interface userRuleForm {
    [props: string]: string | number
}

interface DialogRuleForm {
    userName: string
    userEmail: string
    mobile: string,
    role: string,
    state: number,
    roleList: string
}

// 角色相关类型
interface Role {
    _id?: string | number
    roleId?: string | number
    roleName: string
    remark?: string
    roleDesc?: string
    permissionList?: {
        checkedKeys?: string[]
        halfCheckedKeys?: string[]
    }
    permsList?: string[]
    updateTime?: string
    createTime?: string
}

interface RoleForm {
    roleId?: string | number
    roleName: string
    roleDesc: string
    perms: string[]
}

// 部门相关类型
interface Dept {
    deptId: string | number
    _id?: string | number
    deptName: string
    deptDesc?: string
    userName?: string
    userEmail?: string
    parentId?: string | number | (string | number)[]
    userId?: string | number
    createTime?: string
    updateTime?: string
    children?: Dept[]
    hasChildren?: boolean
}

interface DeptForm {
    deptId?: string | number
    deptName: string
    deptDesc: string
    userName?: string
    userEmail?: string
    parentId?: string | number | (string | number)[]
    userId?: string | number
}

// 菜单相关类型
interface Menu {
    menuId: string | number
    _id?: string | number
    parentId: any
    menuName: string
    menuType: number
    menuIcon?: string
    icon?: string
    menuPath?: string
    path?: string
    menuComponent?: string
    component?: string
    perms?: string
    menuCode?: string
    status?: number
    menuState?: number
    sort?: number
    createTime?: string
    children?: Menu[]
    hasChildren?: boolean
}

interface MenuForm {
    menuId?: string | number
    menuName: string
    menuType: number
    menuIcon: string
    menuPath: string
    menuComponent: string
    parentId: (string | number)[] | number
    sort: number
    status: number
    perms: string
}

// 用户相关类型
interface User {
    userId: string | number
    userName: string
    userEmail: string
    mobile?: string
    job?: string
    state: number
    role: number
    roleList?: string[]
    deptId?: string | number | (string | number)[]
    createTime: string
    lastLoginTime?: string
}

interface RuleForm {
    userName: string
    userEmail: string
    mobile: string
    job: string
    state: number
    role: string[]
    dept: (string | number)[]
}