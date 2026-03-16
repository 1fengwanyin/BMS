<template>
  <div class="track-manager">
    <div id="container"></div>
    <div class="input-card">
      <h4>轨迹回放控制</h4>
      <div class="input-item">
        <input type="button" class="btn" value="开始动画" id="start" @click="startAnimation" />
        <input type="button" class="btn" value="暂停动画" id="pause" @click="pauseAnimation" />
      </div>
      <div class="input-item">
        <input type="button" class="btn" value="继续动画" id="resume" @click="resumeAnimation" />
        <input type="button" class="btn" value="停止动画" id="stop" @click="stopAnimation" />
      </div>
      <div class="input-item">
        <h5>路线规划</h5>
        <div class="coordinate-inputs">
          <div class="input-group">
            <label>起点:</label>
            <input type="text" v-model="startCoord" placeholder="经度,纬度" />
          </div>
          <div class="input-group">
            <label>终点:</label>
            <input type="text" v-model="endCoord" placeholder="经度,纬度" />
          </div>
          <button class="btn" @click="planRoute">规划路线</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AMapLoader from "@amap/amap-jsapi-loader";

// 声明全局变量类型
declare global {
  interface Window {
    _AMapSecurityConfig: any;
    AMap: any;
  }
}

// 地图实例
let map: any = null;
// 标记实例
let marker: any = null;
// 轨迹线条实例
let polyline: any = null;
// 已通过轨迹线条实例
let passedPolyline: any = null;

// 自定义轨迹数据
const hefeiTrack = [
  [117.264047, 31.950512],
  [117.270199, 31.951608],
  [117.270497, 31.950938],
  [117.270763, 31.949616],
  [117.271475, 31.94623],
  [117.272202, 31.942477],
  [117.273043, 31.93846],
  [117.273439, 31.937184],
  [117.274046, 31.935764],
  [117.274854, 31.934495],
  [117.27567, 31.933445],
  [117.276964, 31.932039],
  [117.277756, 31.93112],
  [117.278383, 31.929792],
  [117.278961, 31.927803],
  [117.279582, 31.925657],
  [117.281493, 31.918877],
  [117.282071, 31.915967],
  [117.282793, 31.911988],
  [117.284001, 31.905281],
  [117.284769, 31.901081],
  [117.284723, 31.900694],
  [117.284607, 31.900277],
  [117.284439, 31.899992],
  [117.283873, 31.899335],
  [117.283752, 31.898923],
  [117.283767, 31.89874],
  [117.283996, 31.898415],
  [117.284203, 31.898349],
  [117.284686, 31.898322],
  [117.285533, 31.8984],
  [117.286354, 31.898624],
  [117.289393, 31.899142],
  [117.291669, 31.899772],
  [117.293392, 31.900252],
  [117.294696, 31.900405],
  [117.295418, 31.9004],
  [117.296384, 31.900329],
  [117.297381, 31.900115],
  [117.298703, 31.899624],
  [117.300183, 31.898736],
  [117.301195, 31.897932],
  [117.309473, 31.891953],
  [117.312074, 31.890832],
  [117.312074, 31.890832],
  [117.319397, 31.888097],
  [117.319397, 31.888097]
];

// 路线规划相关变量
const startCoord = ref('117.264047,31.950512'); // 默认起点
const endCoord = ref('117.319397,31.888097'); // 默认终点
let plannedRoute: number[][] = [];

// 开始动画
let startAnimation = () => {
  if (marker) {
    // 使用规划的路线或默认路线
    const route = plannedRoute.length > 0 ? plannedRoute : hefeiTrack;
    marker.moveAlong(route, {
      // 每一段的时长
      duration: 1000, // 可根据实际采集时间间隔设置
      // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
      autoRotation: true,
    });
  }
};

// 规划路线
const planRoute = () => {
  if (!map) return;

  // 解析输入的坐标
  const parseCoord = (coordStr: string): [number, number] | null => {
    const parts = coordStr.split(',').map(p => parseFloat(p.trim()));
    const lat = parts[0];
    const lng = parts[1];
    if (parts.length === 2 && typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)) {
      return [lat, lng];
    }
    return null;
  };

  const start = parseCoord(startCoord.value);
  const end = parseCoord(endCoord.value);

  if (!start || !end) {
    alert('请输入有效的坐标格式：经度,纬度');
    return;
  }

  // 加载路径规划服务
  window.AMap.plugin('AMap.Driving', () => {
    const driving = new window.AMap.Driving({
      map: map,
      panel: false,
      policy: window.AMap.DrivingPolicy.LEAST_TIME // 最快路线
    });

    // 规划路线
    driving.search([
      {
        keyword: '起点',
        location: start
      },
      {
        keyword: '终点',
        location: end
      }
    ], function (status: string, result: any) {
      if (status === 'complete') {
        // 获取规划的路线
        const route = result.routes[0];
        const path = route.steps.flatMap((step: any) => step.path);

        // 更新规划的路线
        plannedRoute = path;

        // 清除旧的轨迹
        if (polyline) {
          map.remove(polyline);
        }
        if (passedPolyline) {
          map.remove(passedPolyline);
        }

        // 绘制新的轨迹
        polyline = new window.AMap.Polyline({
          map: map,
          path: plannedRoute,
          showDir: true,
          strokeColor: "#28F",  // 线颜色
          strokeWeight: 6,      // 线宽
        });

        // 已通过轨迹
        passedPolyline = new window.AMap.Polyline({
          map: map,
          strokeColor: "#AF5",  // 线颜色
          strokeWeight: 6,      // 线宽
        });

        // 标记移动时的事件
        marker.on('moving', function (e: any) {
          passedPolyline.setPath(e.passedPath);
          map.setCenter(e.target.getPosition(), true);
        });

        // 调整地图视野以适应轨迹
        map.setFitView([polyline]);

        // 更新标记位置到起点
        marker.setPosition(start);

        alert('路线规划成功！');
      } else {
        console.error('路径规划失败:', result);
        alert('路径规划失败，请检查坐标是否正确');
      }
    });
  });
};

// 暂停动画
const pauseAnimation = () => {
  if (marker) {
    marker.pauseMove();
  }
};

// 继续动画
const resumeAnimation = () => {
  if (marker) {
    marker.resumeMove();
  }
};

// 停止动画
const stopAnimation = () => {
  if (marker) {
    marker.stopMove();
  }
};

// 初始化地图
function initMap() {
  // 配置安全密钥
  window._AMapSecurityConfig = {
    securityJsCode: "3509003d02b66d970bcf6aa7b23ceae9",
  };

  // 加载地图
  AMapLoader.load({
    key: "248d025f85515fc087e499075a05d587", // 申请好的 Web 端开发者 Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JS API 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.MoveAnimation", "AMap.Scale", "AMap.ToolBar", "AMap.HawkEye", "AMap.ControlBar"], // 需要使用的的插件列表
  })
    .then((AMap: any) => {
      // 创建地图实例
      map = new AMap.Map("container", {
        center: [117.29, 31.92], // 新路线的大致中心点
        zoom: 13, // 调整缩放级别以更好地显示路线
        resizeEnable: true, // 监听地图容器尺寸变化
        viewMode: '2D', // 使用2D模式
        mapStyle: "amap://styles/light", // 设置地图的显示样式
      });

      // 添加控件
      addMapControls(map, AMap);

      // 初始化轨迹回放
      initTrackPlayback(AMap);
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
}

// 初始化轨迹回放
function initTrackPlayback(AMap: any) {
  // 加载动画插件
  AMap.plugin('AMap.MoveAnimation', function () {
    // 创建标记
    marker = new AMap.Marker({
      map: map,
      position: hefeiTrack[0],
      icon: "https://a.amap.com/jsapi_demos/static/demo-center-v2/car.png",
      offset: new AMap.Pixel(-13, -26),
    });

    // 绘制轨迹
    polyline = new AMap.Polyline({
      map: map,
      path: hefeiTrack,
      showDir: true,
      strokeColor: "#28F",  // 线颜色
      strokeWeight: 6,      // 线宽
    });

    // 已通过轨迹
    passedPolyline = new AMap.Polyline({
      map: map,
      strokeColor: "#AF5",  // 线颜色
      strokeWeight: 6,      // 线宽
    });

    // 标记移动时的事件
    marker.on('moving', function (e: any) {
      passedPolyline.setPath(e.passedPath);
      map.setCenter(e.target.getPosition(), true);
    });

    // 调整地图视野以适应轨迹
    map.setFitView([polyline]);

    // 开始动画时使用预设的路线点
    startAnimation = () => {
      if (marker) {
        marker.moveAlong(hefeiTrack, {
          // 每一段的时长
          duration: 1000, // 可根据实际采集时间间隔设置
          // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
          autoRotation: true,
        });
      }
    };
  });
}

// 组件挂载时初始化地图
onMounted(() => {
  initMap();
});
</script>
<style scoped lang="scss">
.track-manager {
  position: relative;
  padding: 24px;
  min-height: 100vh;
  background: var(--el-bg-color, #ffffff);

  #container {
    width: 100%;
    height: 600px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: visible !important;
  }

  .input-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: #fff;
    background-clip: border-box;
    border-radius: .25rem;
    width: 18rem;
    border-width: 0;
    border-radius: 0.4rem;
    box-shadow: 0 2px 6px 0 rgba(114, 124, 245, .5);
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    flex: 1 1 auto;
    padding: 0.5rem 1rem;
    z-index: 1000;

    h4 {
      font-family: inherit;
      line-height: 1.5;
      font-weight: 300;
      color: inherit;
      font-size: 1rem;
      margin-top: 0;
      margin-bottom: .3rem;
    }

    .input-item {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      margin-bottom: .5rem;

      .btn {
        display: inline-block;
        font-weight: 400;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        user-select: none;
        border: 1px solid transparent;
        transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
        background-color: transparent;
        background-image: none;
        color: #25A5F7;
        border-color: #25A5F7;
        padding: .2rem .4rem;
        line-height: 1.4;
        border-radius: 1rem;
        cursor: pointer;
        margin-right: .8rem;
        width: 7rem;
        font-size: 12px;

        &:last-child {
          margin-right: 0;
        }

        &:hover {
          color: #fff;
          background-color: #25A5F7;
          border-color: #25A5F7;
          text-decoration: none;
        }
      }
    }

    .coordinate-inputs {
      width: 100%;
      margin-top: 0.3rem;

      .input-group {
        margin-bottom: 0.3rem;
        display: flex;
        align-items: center;

        label {
          width: 35px;
          font-size: 12px;
          color: #666;
        }

        input {
          flex: 1;
          padding: 0.2rem 0.4rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;

          &:focus {
            outline: none;
            border-color: #25A5F7;
            box-shadow: 0 0 0 2px rgba(37, 165, 247, 0.2);
          }
        }
      }

      .btn {
        width: 100%;
        margin-top: 0.3rem;
        font-size: 12px;
        padding: .2rem .4rem;
      }
    }

    h5 {
      font-size: 12px;
      font-weight: 500;
      color: #333;
      margin-bottom: 0.3rem;
      margin-top: 0;
    }
  }
}
</style>