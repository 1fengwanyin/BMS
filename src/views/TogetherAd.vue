<template>
  <div class="together-manager">
    <div class="map-container" id="container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AMapLoader from "@amap/amap-jsapi-loader";
// 导入区域边界数据
import districtData from '../../hefeibianjie.json';

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
    plugins: ["AMap.Scale", "AMap.ToolBar", "AMap.HawkEye", "AMap.ControlBar", "AMap.DistrictSearch", "AMap.MoveAnimation"], //需要使用的的插件列表
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

// 类型定义
interface Location {
  id: number;
  position: [number, number];
  name: string;
  district: string;
  districtCenter: [number, number];
}

interface DistrictData {
  center: [number, number];
  count: number;
  locations: Location[];
}

// 合肥市区域配置
const hefeiDistricts: Array<{ name: string; center: [number, number]; count: number }> = [
  { name: '蜀山区', center: [117.23, 31.86], count: 13 },
  { name: '庐阳区', center: [117.31, 31.89], count: 12 },
  { name: '瑶海区', center: [117.38, 31.89], count: 12 },
  { name: '包河区', center: [117.32, 31.83], count: 13 },
  { name: '肥东县', center: [117.54, 31.89], count: 12 },
  { name: '肥西县', center: [117.17, 31.70], count: 12 },
  { name: '巢湖市', center: [117.70, 31.70], count: 13 },
  { name: '庐江县', center: [117.20, 31.25], count: 13 }
]; // 总计100个点

// 道路名称列表
const roads = ['长江西路', '徽州大道', '金寨路', '蒙城路', '阜阳路', '包河大道', '繁华大道', '黄山路', '潜山路', '清溪路'];

// 在合肥市范围内生成随机位置的函数
function generateRandomLocations(): Location[] {
  // 按区域组织的位置数据
  const districtLocations: Location[] = [];

  // 为每个区域生成指定数量的位置
  hefeiDistricts.forEach(district => {
    const { name, center, count } = district;

    for (let i = 0; i < count; i++) {
      // 在区域中心周围随机生成位置，范围约5公里
      const randomLng = center[0] + (Math.random() - 0.5) * 0.1;
      const randomLat = center[1] + (Math.random() - 0.5) * 0.1;
      // 随机选择道路名称
      const randomRoad = roads[Math.floor(Math.random() * roads.length)];
      // 添加位置到数组
      districtLocations.push({
        id: districtLocations.length + 1,
        position: [randomLng, randomLat],
        name: `合肥市${name}${randomRoad}`,
        district: name,
        districtCenter: center
      });
    }
  });

  return districtLocations;
}

// 按区域分组位置数据
function groupLocationsByDistrict(locations: Location[]): Record<string, DistrictData> {
  const grouped: Record<string, DistrictData> = {};

  locations.forEach(location => {
    const district = location.district;
    if (!grouped[district]) {
      grouped[district] = {
        center: location.districtCenter,
        count: 0,
        locations: []
      };
    }
    // 确保TypeScript知道grouped[district]是已定义的
    const districtData = grouped[district];
    districtData.count++;
    districtData.locations.push(location);
  });

  return grouped;
}

// 添加圆形标记点和文本标记函数
function addCircleMarker(map: any, AMap: any) {
  // 生成随机位置数组
  const locations = generateRandomLocations();
  // 按区域分组位置数据
  const groupedLocations = groupLocationsByDistrict(locations);

  // 存储所有标记点，用于缩放级别变化时的控制
  const markers: {
    districtMarkers: Array<{ circleMarker: any; text: any }>;
    locationMarkers: Array<{ circleMarker: any; text: any; district: string }>;
  } = {
    districtMarkers: [],
    locationMarkers: []
  };

  // 为每个区域创建聚合标记（大范围显示）
  Object.keys(groupedLocations).forEach(districtName => {
    const districtInfo = groupedLocations[districtName];
    if (districtInfo) {
      const { center, count } = districtInfo;

      // 创建区域聚合文本标记（圆形）
      const districtText = new AMap.Text({
        text: `${districtName}\n${count}个点`,
        anchor: 'center', // 设置文本标记锚点
        draggable: false, // 不可拖拽
        cursor: 'pointer',
        zIndex: 10, // 确保文本框在圆形标记点之上
        style: {
          'padding': '1rem',
          'border-radius': '50%', // 圆形文本框
          'background-color': 'rgba(64, 158, 255, 0.2)', // 高度透明的背景色
          'width': '100px',
          'height': '100px',
          'display': 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          'justify-content': 'center',
          'border': '2px solid rgba(64, 158, 255, 0.8)', // 更明显的边框
          'box-shadow': '0 6px 16px 0 rgba(64, 158, 255, .3)',
          'text-align': 'center',
          'font-size': '13px',
          'font-weight': '600',
          'color': '#409EFF', // 蓝色文本
          'transition': 'all 0.3s ease',
          'backdrop-filter': 'blur(10px)'
        },
        position: center
      });

      // 存储区域高亮对象
      let districtPolygon: any = null;

      // 存储区域边界数据
      let districtBoundary: [number, number][] | null = null;

      // 获取区域边界数据
      function getDistrictBoundary(districtName: string, callback: (path: [number, number][]) => void) {
        // 如果已经获取过边界数据，直接使用
        if (districtBoundary) {
          callback(districtBoundary);
          return;
        }

        console.log('正在获取区域边界:', districtName);

        // 从导入的JSON文件中查找区域边界
        if (districtData && districtData.features) {
          console.log('JSON文件加载成功，包含', districtData.features.length, '个区域');

          // 打印所有可用的区域名称
          const availableDistricts = districtData.features.map((f: any) => f.properties.name);
          console.log('可用区域:', availableDistricts);

          const feature = districtData.features.find((f: any) => f.properties.name === districtName);

          if (feature) {
            console.log('找到区域:', feature.properties.name);

            if (feature.geometry && feature.geometry.coordinates) {
              console.log('找到边界数据，类型:', feature.geometry.type);
              console.log('边界数据长度:', feature.geometry.coordinates.length);

              // 解析边界数据
              const coordinates = feature.geometry.coordinates;
              // GeoJSON的coordinates格式为[[[[lng, lat], ...]]]，需要提取最内层的坐标数组
              const path: [number, number][] = [];

              // 处理MultiPolygon类型
              if (feature.geometry.type === 'MultiPolygon') {
                coordinates.forEach((polygon: any) => {
                  polygon.forEach((ring: any) => {
                    ring.forEach((point: any) => {
                      path.push([point[0], point[1]] as [number, number]);
                    });
                  });
                });
              }
              // 处理Polygon类型
              else if (feature.geometry.type === 'Polygon') {
                coordinates.forEach((ring: any) => {
                  ring.forEach((point: any) => {
                    path.push([point[0], point[1]] as [number, number]);
                  });
                });
              }

              if (path.length > 0) {
                console.log('解析成功，边界点数量:', path.length);
                districtBoundary = path;
                callback(path);
                return;
              } else {
                console.error('边界数据解析失败，路径长度为0');
              }
            } else {
              console.error('区域没有边界数据');
            }
          } else {
            console.error('未找到区域:', districtName);
          }
        } else {
          console.error('JSON文件加载失败或没有features数据');
        }

        // 如果未找到边界数据，直接报错
        console.error('错误：未找到区域边界数据:', districtName);
        // 不使用默认多边形，直接传递空数组
        callback([]);
      }

      // 初始化时创建并显示区域边界
      getDistrictBoundary(districtName, function (polygonPath) {
        // 只有当路径不为空时才创建多边形
        if (polygonPath.length > 0) {
          districtPolygon = new AMap.Polygon({
            path: polygonPath,
            fillColor: '#ccebc5',
            strokeOpacity: 1,
            fillOpacity: 0.3,
            strokeColor: '#2b8cbe',
            strokeWeight: 1,
            strokeStyle: 'dashed',
            strokeDasharray: [5, 5],
            zIndex: 9
          });
          districtPolygon.setMap(map);
        }
      });

      // 添加鼠标移入效果
      districtText.on('mouseover', function () {
        districtText.setStyle({
          'transform': 'scale(1.1)',
          'background-color': 'rgba(64, 158, 255, 0.3)', // 稍微增加透明度
          'border': '2px solid rgba(64, 158, 255, 1)', // 更明显的边框
          'box-shadow': '0 8px 20px 0 rgba(64, 158, 255, .4)',
          'transition': 'all 0.3s ease'
        });

        // 高亮区域边界
        if (districtPolygon) {
          districtPolygon.setOptions({
            fillOpacity: 0.7,
            fillColor: '#7bccc4'
          });
        }
      });

      // 添加鼠标移出效果
      districtText.on('mouseout', function () {
        districtText.setStyle({
          'transform': 'scale(1)',
          'background-color': 'rgba(64, 158, 255, 0.2)', // 恢复高度透明的背景色
          'border': '2px solid rgba(64, 158, 255, 0.8)', // 恢复边框
          'box-shadow': '0 6px 16px 0 rgba(64, 158, 255, .3)',
          'transition': 'all 0.3s ease'
        });

        // 恢复区域边界默认样式
        if (districtPolygon) {
          districtPolygon.setOptions({
            fillOpacity: 0.3,
            fillColor: '#ccebc5'
          });
        }
      });

      // 添加点击效果，点击区域聚合标记时缩放至该区域
      districtText.on('click', function () {
        map.setZoomAndCenter(12, center);
      });

      // 存储区域聚合标记
      markers.districtMarkers.push({ circleMarker: null, text: districtText });
    }
  });

  // 为每个具体位置创建标记（小范围显示）
  locations.forEach(location => {
    const { position, name, district } = location;

    // 创建圆形标记点
    const circleMarker = new AMap.CircleMarker({
      center: position,
      radius: 9, // 适当的半径
      strokeColor: '#409EFF', // 边框颜色
      strokeOpacity: 1, // 边框透明度
      strokeWeight: 2, // 边框宽度
      fillColor: '#409EFF', // 填充颜色
      fillOpacity: 0.4, // 填充透明度
      zIndex: 15,
      draggable: false // 不可拖拽
    });

    // 创建文本标记（鼠标移入时显示）
    const text = new AMap.Text({
      text: `${name}\n${position[0].toFixed(6)}, ${position[1].toFixed(6)}`,
      anchor: 'bottom-center', // 设置文本标记锚点
      draggable: false, // 不可拖拽
      cursor: 'pointer',
      zIndex: 20, // 确保文本框在圆形标记点之上
      style: {
        'padding': '.5rem 1rem',
        'margin-bottom': '1rem',
        'border-radius': '12px',
        'background-color': 'rgba(64, 158, 255, 0.2)', // 高度透明的背景色
        'min-width': '160px',
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        'border': '2px solid rgba(64, 158, 255, 0.8)', // 更明显的边框
        'box-shadow': '0 6px 16px 0 rgba(64, 158, 255, .3)',
        'text-align': 'center',
        'font-size': '12px',
        'font-weight': '600',
        'color': '#409EFF', // 蓝色文本
        'transition': 'all 0.3s ease',
        'backdrop-filter': 'blur(10px)'
      },
      position: position
    });

    // 添加鼠标移入效果
    circleMarker.on('mouseover', function () {
      text.setMap(map);
      // 标记点放大效果
      circleMarker.setRadius(12);
      // 文本框鼠标移入效果
      text.setStyle({
        'background-color': 'rgba(64, 158, 255, 0.3)', // 稍微增加透明度
        'border': '2px solid rgba(64, 158, 255, 1)', // 更明显的边框
        'box-shadow': '0 8px 20px 0 rgba(64, 158, 255, .4)',
        'transition': 'all 0.3s ease'
      });
    });

    // 添加鼠标移出效果
    circleMarker.on('mouseout', function () {
      text.setMap(null);
      // 标记点恢复原始大小
      circleMarker.setRadius(9);
      // 文本框恢复原始样式
      text.setStyle({
        'background-color': 'rgba(64, 158, 255, 0.2)', // 恢复高度透明的背景色
        'border': '2px solid rgba(64, 158, 255, 0.8)', // 恢复边框
        'box-shadow': '0 6px 16px 0 rgba(64, 158, 255, .3)',
        'transition': 'all 0.3s ease'
      });
    });

    // 初始隐藏文本标记
    text.setMap(null);

    // 添加鼠标移入效果
    circleMarker.on('mouseover', function () {
      text.setMap(map);
    });

    // 添加鼠标移出效果
    circleMarker.on('mouseout', function () {
      text.setMap(null);
    });

    // 添加点击效果
    circleMarker.on('click', function () {
      // 目标缩放级别
      const targetZoom = 15;
      // 将地图缩放并居中到该位置
      map.setZoomAndCenter(targetZoom, position);
    });

    // 存储位置标记
    markers.locationMarkers.push({ circleMarker, text, district });
  });

  // 根据缩放级别更新标记点显示状态
  function updateMarkersByZoom() {
    // 获取当前缩放级别
    const zoom = map.getZoom();
    console.log('当前缩放级别:', zoom);

    // 当缩放级别小于等于11时（对应约5公里比例尺），显示区域聚合标记，隐藏具体位置标记
    if (zoom <= 11) {
      // 显示区域聚合标记
      markers.districtMarkers.forEach(marker => {
        if (marker.circleMarker) {
          marker.circleMarker.setMap(map);
        }
        marker.text.setMap(map);
      });
      // 隐藏具体位置标记
      markers.locationMarkers.forEach(marker => {
        marker.circleMarker.setMap(null);
        marker.text.setMap(null);
      });
      console.log('显示区域聚合标记');
    } else {
      // 隐藏区域聚合标记
      markers.districtMarkers.forEach(marker => {
        if (marker.circleMarker) {
          marker.circleMarker.setMap(null);
        }
        marker.text.setMap(null);
      });
      // 显示具体位置标记
      markers.locationMarkers.forEach(marker => {
        marker.circleMarker.setMap(map);
        // 文本标记保持隐藏，只在鼠标移入时显示
        marker.text.setMap(null);
      });
      console.log('显示具体位置标记');
    }
  }

  // 监听地图缩放级别变化
  map.on('zoomend', function () {
    updateMarkersByZoom();
  });

  // 初始化时根据当前缩放级别设置标记点显示状态
  updateMarkersByZoom();

  // 监听地图大小变化，同步调整圆框大小
  map.on('resize', function () {
    // 获取地图容器大小
    const container = document.getElementById('container');
    if (container) {
      const rect = container.getBoundingClientRect();
      // 根据地图宽度动态调整圆框大小
      const newSize = Math.min(rect.width, rect.height) * 0.15 + 'px';
      // 更新所有圆框大小
      markers.locationMarkers.forEach(marker => {
        marker.text.setStyle({
          'min-width': newSize
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
