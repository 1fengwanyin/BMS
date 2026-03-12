<template>
  <div class="together-manager">
    <div class="map-container" id="container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AMapLoader from "@amap/amap-jsapi-loader";

// 声明全局变量类型
declare global {
  interface Window {
    _AMapSecurityConfig: any;
    AMap: any;
  }
}

// 初始化地图函数
function initMap() {
  // 配置安全密钥
  window._AMapSecurityConfig = {
    securityJsCode: "3509003d02b66d970bcf6aa7b23ceae9",
  };

  // 加载地图
  AMapLoader.load({
    key: "248d025f85515fc087e499075a05d587", //申请好的 Web 端开发者 Key，首次调用 load 时必填
    version: "2.0", //指定要加载的 JS API 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.Scale", "AMap.ToolBar", "AMap.HawkEye", "AMap.ControlBar"], //需要使用的的插件列表
  })
    .then((AMap: any) => {
      // 创建地图实例
      const map = new AMap.Map("container", {
        center: [117.263993, 31.95078], // 默认中心点坐标
        zoom: 11, // 默认缩放级别
        resizeEnable: true, // 监听地图容器尺寸变化
        viewMode: '2D', // 使用2D模式
        mapStyle: "amap://styles/light", //设置地图的显示样式
      });

      // 添加控件
      addMapControls(map, AMap);
    })
    .catch((e: any) => {
      console.error('地图加载失败:', e);
    });
}

// 添加地图控件函数
function addMapControls(map: any, AMap: any) {
  // 比例尺
  const scale = new AMap.Scale({
    visible: true
  });

  // 工具栏
  const toolBar = new AMap.ToolBar({
    visible: true,
    position: {
      top: '110px',
      right: '40px'
    }
  });

  // 控制栏
  const controlBar = new AMap.ControlBar({
    visible: true,
    position: {
      top: '10px',
      right: '10px'
    }
  });

  // 鹰眼
  const overView = new AMap.HawkEye({
    visible: true
  });

  // 添加控件到地图
  map.addControl(scale);
  map.addControl(toolBar);
  map.addControl(controlBar);
  map.addControl(overView);

  // 添加圆形标记点和文本标记
  addCircleMarker(map, AMap);
}

// 在合肥市范围内生成随机位置的函数
function generateRandomLocations() {
  // 合肥市中心坐标
  const centerLng = 117.263993;
  const centerLat = 31.95078;
  // 合肥市区域列表
  const districts = ['蜀山区', '庐阳区', '瑶海区', '包河区', '肥东县', '肥西县', '长丰县', '庐江县', '巢湖市'];
  // 道路名称列表
  const roads = ['长江西路', '徽州大道', '金寨路', '蒙城路', '阜阳路', '包河大道', '繁华大道', '黄山路', '潜山路', '清溪路'];
  // 随机位置数组
  const locations = [];
  // 生成10个随机位置
  for (let i = 1; i <= 10; i++) {
    // 在中心坐标周围随机生成位置，范围约10公里
    const randomLng = centerLng + (Math.random() - 0.5) * 0.2;
    const randomLat = centerLat + (Math.random() - 0.5) * 0.2;
    // 随机选择区域和道路名称
    const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
    const randomRoad = roads[Math.floor(Math.random() * roads.length)];
    // 添加位置到数组
    locations.push({
      id: i,
      position: [randomLng, randomLat],
      name: `合肥市${randomDistrict}${randomRoad}`
    });
  }
  return locations;
}

// 添加圆形标记点和文本标记函数
function addCircleMarker(map: any, AMap: any) {
  // 生成随机位置数组
  const locations = generateRandomLocations();

  // 初始圆形描述框大小
  let boxSize = '8rem'; // 减小圆框大小

  // 存储所有标记点，用于缩放级别变化时的控制
  const markers = [];

  // 遍历位置数组，为每个位置创建标记
  locations.forEach(location => {
    const { position, name } = location;

    // 创建圆形标记点
    const circleMarker = new AMap.CircleMarker({
      center: position,
      radius: 8, // 减小半径
      strokeColor: '#1890ff', // 边框颜色
      strokeOpacity: 1, // 边框透明度
      strokeWeight: 2, // 边框宽度
      fillColor: '#1890ff', // 填充颜色
      fillOpacity: 0.35, // 填充透明度
      zIndex: 10,
      draggable: false // 不可拖拽
    });

    // 添加圆形标记点到地图
    circleMarker.setMap(map);

    // 创建圆形描述框，显示位置名称
    const text = new AMap.Text({
      text: name,
      anchor: 'bottom-center', // 设置文本标记锚点
      draggable: false, // 不可拖拽
      cursor: 'pointer',
      style: {
        'padding': '.5rem 1rem', // 减小内边距
        'margin-bottom': '1rem',
        'border-radius': '50%', // 圆形描述框
        'background-color': 'rgba(25, 133, 255, 0.05)', // 更透明的浅蓝色背景
        'width': boxSize,
        'height': boxSize,
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'border': '1px solid rgba(25, 133, 255, 0.3)', // 更透明的蓝色边框，减小边框宽度
        'box-shadow': '0 4px 12px 0 rgba(114, 124, 245, .1)', // 更柔和的阴影
        'text-align': 'center',
        'font-size': '12px', // 减小字体大小
        'font-weight': '600', // 加粗字体
        'color': '#0066cc', // 深蓝色文本
        'transition': 'all 0.3s ease', // 过渡效果
        'backdrop-filter': 'blur(10px)' // 增强背景模糊效果
      },
      position: position
    });

    // 添加文本标记到地图
    text.setMap(map);

    // 创建小圆点标记（当比例尺达到五十公里时显示）
    const smallMarker = new AMap.CircleMarker({
      center: position,
      radius: 5, // 小圆点半径
      strokeColor: '#1890ff', // 边框颜色
      strokeOpacity: 1, // 边框透明度
      strokeWeight: 2, // 边框宽度
      fillColor: '#1890ff', // 填充颜色
      fillOpacity: 0.8, // 填充透明度
      zIndex: 10,
      draggable: false // 不可拖拽
    });

    // 初始隐藏小圆点标记
    smallMarker.setMap(null);

    // 添加鼠标移入效果
    text.on('mouseover', function () {
      // 改变文本标记的样式，增加移入效果
      text.setStyle({
        'background-color': 'rgba(25, 133, 255, 0.1)', // 增加背景透明度
        'border': '1px solid rgba(25, 133, 255, 0.6)', // 增加边框透明度
        'box-shadow': '0 6px 16px 0 rgba(114, 124, 245, .2)', // 增强阴影效果
        'transform': 'scale(1.05)', // 轻微放大效果
        'transition': 'all 0.3s ease' // 过渡效果
      });
    });

    // 添加鼠标移出效果
    text.on('mouseout', function () {
      // 恢复文本标记的原始样式
      text.setStyle({
        'background-color': 'rgba(25, 133, 255, 0.05)', // 恢复背景透明度
        'border': '1px solid rgba(25, 133, 255, 0.3)', // 恢复边框透明度
        'box-shadow': '0 4px 12px 0 rgba(114, 124, 245, .1)', // 恢复阴影效果
        'transform': 'scale(1)', // 恢复原始大小
        'transition': 'all 0.3s ease' // 过渡效果
      });
    });

    // 添加点击效果
    text.on('click', function (e: any) {
      // 获取标记点的位置
      const position = text.getPosition();
      // 目标缩放级别
      const targetZoom = 15;
      // 将地图缩放并居中到该位置
      map.setZoomAndCenter(targetZoom, position);

      // 当地图达到最大缩放级别时，将圆形标记点转变为 AMap.Marker
      if (targetZoom >= map.getMaxZoom()) {
        // 移除原来的圆形标记点
        circleMarker.setMap(null);

        // 创建 AMap.Marker
        const marker = new AMap.Marker({
          position: position,
          title: name,
          draggable: false
        });

        // 添加到地图
        marker.setMap(map);

        // 存储新的标记点
        marker.text = text;
        markers.push({ circleMarker: marker, text, smallMarker });
      }
    });

    // 存储标记点
    markers.push({ circleMarker, text, smallMarker });
  });

  // 监听地图缩放级别变化
  map.on('zoomend', function () {
    // 获取当前缩放级别
    const zoom = map.getZoom();

    // 当地图缩放级别小于等于10时（对应约五十公里比例尺），显示小圆点标记，隐藏圆形标记点和文本描述框
    if (zoom <= 10) {
      markers.forEach(marker => {
        marker.circleMarker.setMap(null);
        marker.text.setMap(null);
        marker.smallMarker.setMap(map);
      });
    } else {
      // 当地图缩放级别大于10时，显示圆形标记点和文本描述框，隐藏小圆点标记
      markers.forEach(marker => {
        marker.circleMarker.setMap(map);
        marker.text.setMap(map);
        marker.smallMarker.setMap(null);
      });
    }
  });

  // 监听地图大小变化，同步调整圆框大小
  map.on('resize', function () {
    // 获取地图容器大小
    const container = document.getElementById('container');
    if (container) {
      const rect = container.getBoundingClientRect();
      // 根据地图宽度动态调整圆框大小
      const newSize = Math.min(rect.width, rect.height) * 0.15 + 'px';
      // 更新所有圆框大小
      markers.forEach(marker => {
        marker.text.setStyle({
          'width': newSize,
          'height': newSize
        });
      });
    }
  });
}

onMounted(() => {
  // 调用初始化地图函数
  initMap();
});
</script>

<style scoped lang="scss">
.together-manager {
  position: relative;
  padding: 24px;
  min-height: 100vh;
  background: var(--el-bg-color, #ffffff);

  .map-container {
    width: 100%;
    height: 600px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: visible !important;
    /* 确保控件不被裁剪 */
  }
}
</style>
