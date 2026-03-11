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