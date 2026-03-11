<template>
    <template v-for="item in userMenu" :key="item._id">
        <!-- 只渲染菜单类型 (menuType: 1) -->
        <template v-if="item.menuType === 1">
            <!-- 多级菜单 -->
            <el-sub-menu :index="item.path || String(item._id)" v-if="hasMenuChildren(item)">
                <template #title>
                    <el-icon>
                        <component :is="item.icon || 'Location'" />
                    </el-icon>
                    <span>{{ item.menuName }}</span>
                </template>
                <!-- 递归渲染子菜单 -->
                <TreeMenu :userMenu="item.children" @menu-click="handleMenuClick" />
            </el-sub-menu>

            <!-- 单级菜单 -->
            <el-menu-item :index="item.path || String(item._id)" v-else @click="handleMenuClick(item)">
                <span class="menu-item-title">{{ item.menuName }}</span>
            </el-menu-item>
        </template>
    </template>
</template>

<script setup lang="ts">
const props = defineProps(['userMenu'])
const emit = defineEmits(['menu-click'])

const hasMenuChildren = (item: any) => {
    if (!item.children || item.children.length === 0) return false
    return item.children.some((child: any) => child.menuType === 1)
}

const handleMenuClick = (item: any) => {
    emit('menu-click', item)
}
</script>

<style scoped>
/* 菜单项标题样式 */
.menu-item-title {
    display: inline-block;
}

/* 子菜单标题样式 */
.sub-menu-title {
    display: inline-block;
}
</style>
