<template>
  <div class="card-container">
    <el-card class="stats-card">
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">访问数</div>
          <div class="card-period">月</div>
        </div>
        <div class="card-divider"></div>
        <div class="card-body">
          <div class="card-value">$2,000</div>
          <div class="card-icon">
            <el-icon class="icon animate-bounce">
              <Timer />
            </el-icon>
          </div>
        </div>
        <div class="card-footer">
          <div class="card-subtitle">总访问数</div>
          <div class="card-total">120,000</div>
        </div>
      </div>
    </el-card>
    <el-card class="stats-card">
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">成交量</div>
          <div class="card-period">月</div>
        </div>
        <div class="card-divider"></div>
        <div class="card-body">
          <div class="card-value">$20,000</div>
          <div class="card-icon">
            <el-icon class="icon animate-pulse">
              <Wallet />
            </el-icon>
          </div>
        </div>
        <div class="card-footer">
          <div class="card-subtitle">总成交量</div>
          <div class="card-total">500,000</div>
        </div>
      </div>
    </el-card>
    <el-card class="stats-card">
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">下载数</div>
          <div class="card-period">周</div>
        </div>
        <div class="card-divider"></div>
        <div class="card-body">
          <div class="card-value">$8,000</div>
          <div class="card-icon">
            <el-icon class="icon animate-bounce">
              <Download />
            </el-icon>
          </div>
        </div>
        <div class="card-footer">
          <div class="card-subtitle">总下载数</div>
          <div class="card-total">120,000</div>
        </div>
      </div>
    </el-card>
    <el-card class="stats-card">
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">成交数</div>
          <div class="card-period">年</div>
        </div>
        <div class="card-divider"></div>
        <div class="card-body">
          <div class="card-value">$5,000</div>
          <div class="card-icon">
            <el-icon class="icon animate-pulse">
              <View />
            </el-icon>
          </div>
        </div>
        <div class="card-footer">
          <div class="card-subtitle">总成交数</div>
          <div class="card-total">50,000</div>
        </div>
      </div>
    </el-card>
  </div>
  <div ref="echartsContainer" class="echarts-container"></div>

  <!-- 三个图表的容器 -->
  <div class="charts-wrapper">
    <div ref="radarChart" class="chart-box"></div>
    <div ref="chart2" class="chart-box"></div>
    <div ref="chart3" class="chart-box"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Timer, Wallet, Download, View } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import Api from '../api'

const echartsContainer = ref<HTMLDivElement>()
const radarChart = ref<HTMLDivElement>()
const chart2 = ref<HTMLDivElement>()
const chart3 = ref<HTMLDivElement>()

// 真实数据
const rawData = [
  ['2013/1/24', 2320.26, 2320.26, 2287.3, 2362.94],
  ['2013/1/25', 2300, 2291.3, 2288.26, 2308.38],
  ['2013/1/28', 2295.35, 2346.5, 2295.35, 2346.92],
  ['2013/1/29', 2347.22, 2358.98, 2337.35, 2363.8],
  ['2013/1/30', 2360.75, 2382.48, 2347.89, 2383.76],
  ['2013/1/31', 2383.43, 2385.42, 2371.23, 2391.82],
  ['2013/2/1', 2377.41, 2419.02, 2369.57, 2421.15],
  ['2013/2/4', 2425.92, 2428.15, 2417.58, 2440.38],
  ['2013/2/5', 2411, 2433.13, 2403.3, 2437.42],
  ['2013/2/6', 2432.68, 2434.48, 2427.7, 2441.73],
  ['2013/2/7', 2430.69, 2418.53, 2394.22, 2433.89],
  ['2013/2/8', 2416.62, 2432.4, 2414.4, 2443.03],
  ['2013/2/18', 2441.91, 2421.56, 2415.43, 2444.8],
  ['2013/2/19', 2420.26, 2382.91, 2373.53, 2427.07],
  ['2013/2/20', 2383.49, 2397.18, 2370.61, 2397.94],
  ['2013/2/21', 2378.82, 2325.95, 2309.17, 2378.82],
  ['2013/2/22', 2322.94, 2314.16, 2308.76, 2330.88],
  ['2013/2/25', 2320.62, 2325.82, 2315.01, 2338.78],
  ['2013/2/26', 2313.74, 2293.34, 2289.89, 2340.71],
  ['2013/2/27', 2297.77, 2313.22, 2292.03, 2324.63],
  ['2013/2/28', 2322.32, 2365.59, 2308.92, 2366.16],
  ['2013/3/1', 2364.54, 2359.51, 2330.86, 2369.65],
  ['2013/3/4', 2332.08, 2273.4, 2259.25, 2333.54],
  ['2013/3/5', 2274.81, 2326.31, 2270.1, 2328.14],
  ['2013/3/6', 2333.61, 2347.18, 2321.6, 2351.44],
  ['2013/3/7', 2340.44, 2324.29, 2304.27, 2352.02],
  ['2013/3/8', 2326.42, 2318.61, 2314.59, 2333.67],
  ['2013/3/11', 2314.68, 2310.59, 2296.58, 2320.96],
  ['2013/3/12', 2309.16, 2286.6, 2264.83, 2333.29],
  ['2013/3/13', 2282.17, 2263.97, 2253.25, 2286.33],
  ['2013/3/14', 2255.77, 2270.28, 2253.31, 2276.22],
  ['2013/3/15', 2269.31, 2278.4, 2250, 2312.08],
  ['2013/3/18', 2267.29, 2240.02, 2239.21, 2276.05],
  ['2013/3/19', 2244.26, 2257.43, 2232.02, 2261.31],
  ['2013/3/20', 2257.74, 2317.37, 2257.42, 2317.86],
  ['2013/3/21', 2318.21, 2324.24, 2311.6, 2330.81],
  ['2013/3/22', 2321.4, 2328.28, 2314.97, 2332],
  ['2013/3/25', 2334.74, 2326.72, 2319.91, 2344.89],
  ['2013/3/26', 2318.58, 2297.67, 2281.12, 2319.99],
  ['2013/3/27', 2299.38, 2301.26, 2289, 2323.48],
  ['2013/3/28', 2273.55, 2236.3, 2232.91, 2273.55],
  ['2013/3/29', 2238.49, 2236.62, 2228.81, 2246.87],
  ['2013/4/1', 2229.46, 2234.4, 2227.31, 2243.95],
  ['2013/4/2', 2234.9, 2227.74, 2220.44, 2253.42],
  ['2013/4/3', 2232.69, 2225.29, 2217.25, 2241.34],
  ['2013/4/8', 2196.24, 2211.59, 2180.67, 2212.59],
  ['2013/4/9', 2215.47, 2225.77, 2215.47, 2234.73],
  ['2013/4/10', 2224.93, 2226.13, 2212.56, 2233.04],
  ['2013/4/11', 2236.98, 2219.55, 2217.26, 2242.48],
  ['2013/4/12', 2218.09, 2206.78, 2204.44, 2226.26],
  ['2013/4/15', 2199.91, 2181.94, 2177.39, 2204.99],
  ['2013/4/16', 2169.63, 2194.85, 2165.78, 2196.43],
  ['2013/4/17', 2195.03, 2193.8, 2178.47, 2197.51],
  ['2013/4/18', 2181.82, 2197.6, 2175.44, 2206.03],
  ['2013/4/19', 2201.12, 2244.64, 2200.58, 2250.11],
  ['2013/4/22', 2236.4, 2242.17, 2232.26, 2245.12],
  ['2013/4/23', 2242.62, 2184.54, 2182.81, 2242.62],
  ['2013/4/24', 2187.35, 2218.32, 2184.11, 2226.12],
  ['2013/4/25', 2213.19, 2199.31, 2191.85, 2224.63],
  ['2013/4/26', 2203.89, 2177.91, 2173.86, 2210.58],
  ['2013/5/2', 2170.78, 2174.12, 2161.14, 2179.65],
  ['2013/5/3', 2179.05, 2205.5, 2179.05, 2222.81],
  ['2013/5/6', 2212.5, 2231.17, 2212.5, 2236.07],
  ['2013/5/7', 2227.86, 2235.57, 2219.44, 2240.26],
  ['2013/5/8', 2242.39, 2246.3, 2235.42, 2255.21],
  ['2013/5/9', 2246.96, 2232.97, 2221.38, 2247.86],
  ['2013/5/10', 2228.82, 2246.83, 2225.81, 2247.67],
  ['2013/5/13', 2247.68, 2241.92, 2231.36, 2250.85],
  ['2013/5/14', 2238.9, 2217.01, 2205.87, 2239.93],
  ['2013/5/15', 2217.09, 2224.8, 2213.58, 2225.19],
  ['2013/5/16', 2221.34, 2251.81, 2210.77, 2252.87],
  ['2013/5/17', 2249.81, 2282.87, 2248.41, 2288.09],
  ['2013/5/20', 2286.33, 2299.99, 2281.9, 2309.39],
  ['2013/5/21', 2297.11, 2305.11, 2290.12, 2305.3],
  ['2013/5/22', 2303.75, 2302.4, 2292.43, 2314.18],
  ['2013/5/23', 2293.81, 2275.67, 2274.1, 2304.95],
  ['2013/5/24', 2281.45, 2288.53, 2270.25, 2292.59],
  ['2013/5/27', 2286.66, 2293.08, 2283.94, 2301.7],
  ['2013/5/28', 2293.4, 2321.32, 2281.47, 2322.1],
  ['2013/5/29', 2323.54, 2324.02, 2321.17, 2334.33],
  ['2013/5/30', 2316.25, 2317.75, 2310.49, 2325.72],
  ['2013/5/31', 2320.74, 2300.59, 2299.37, 2325.53],
  ['2013/6/3', 2300.21, 2299.25, 2294.11, 2313.43],
  ['2013/6/4', 2297.1, 2272.42, 2264.76, 2297.1],
  ['2013/6/5', 2270.71, 2270.93, 2260.87, 2276.86],
  ['2013/6/6', 2264.43, 2242.11, 2240.07, 2266.69],
  ['2013/6/7', 2242.26, 2210.9, 2205.07, 2250.63],
  ['2013/6/13', 2190.1, 2148.35, 2126.22, 2190.1]
]

const upColor = '#ec0000'
const upBorderColor = '#8A0000'
const downColor = '#00da3c'
const downBorderColor = '#008F28'

function splitData(rawData: any[]) {
  const categoryData = []
  const values = []
  for (let i = 0; i < rawData.length; i++) {
    categoryData.push(rawData[i].splice(0, 1)[0])
    values.push(rawData[i])
  }
  return {
    categoryData: categoryData,
    values: values
  }
}

const data0 = splitData(rawData)

function calculateMA(dayCount: number) {
  const result = []
  for (let i = 0, len = data0.values.length; i < len; i++) {
    if (i < dayCount) {
      result.push('-')
      continue
    }
    let sum = 0
    for (let j = 0; j < dayCount; j++) {
      sum += +data0.values[i - j][1]
    }
    result.push(sum / dayCount)
  }
  return result
}

onMounted(async () => {
  // 获取后端数据
  let echartsData: any = null
  try {
    const res: any = await Api.getEchartsData()
    if (res.code === 200 && res.data) {
      echartsData = res.data
    }
  } catch (error) {
    console.error('获取ECharts数据失败:', error)
  }

  if (echartsContainer.value) {
    const myChart = echarts.init(echartsContainer.value)

    const option = {
      title: {
        text: '上证指数',
        left: 0
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
        top: 20
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: data0.categoryData,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100
        },
        {
          show: true,
          type: 'slider',
          top: '90%',
          start: 50,
          end: 100
        }
      ],
      series: [
        {
          name: '日K',
          type: 'candlestick',
          data: data0.values,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upBorderColor,
            borderColor0: downBorderColor
          },
          markPoint: {
            label: {
              formatter: function (param: any) {
                return param != null ? Math.round(param.value) + '' : ''
              }
            },
            data: [
              {
                name: 'Mark',
                coord: ['2024/01/15', 3050],
                value: 3050,
                itemStyle: {
                  color: 'rgb(41,60,85)'
                }
              },
              {
                name: 'highest value',
                type: 'max',
                valueDim: 'highest'
              },
              {
                name: 'lowest value',
                type: 'min',
                valueDim: 'lowest'
              },
              {
                name: 'average value on close',
                type: 'average',
                valueDim: 'close'
              }
            ],
            tooltip: {
              formatter: function (param: any) {
                return param.name + '<br>' + (param.data.coord || '')
              }
            }
          },
          markLine: {
            symbol: ['none', 'none'],
            data: [
              [
                {
                  name: 'from lowest to highest',
                  type: 'min',
                  valueDim: 'lowest',
                  symbol: 'circle',
                  symbolSize: 10,
                  label: {
                    show: false
                  },
                  emphasis: {
                    label: {
                      show: false
                    }
                  }
                },
                {
                  type: 'max',
                  valueDim: 'highest',
                  symbol: 'circle',
                  symbolSize: 10,
                  label: {
                    show: false
                  },
                  emphasis: {
                    label: {
                      show: false
                    }
                  }
                }
              ],
              {
                name: 'min line on close',
                type: 'min',
                valueDim: 'close'
              },
              {
                name: 'max line on close',
                type: 'max',
                valueDim: 'close'
              }
            ]
          }
        },
        {
          name: 'MA5',
          type: 'line',
          data: calculateMA(5),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'MA10',
          type: 'line',
          data: calculateMA(10),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'MA20',
          type: 'line',
          data: calculateMA(20),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'MA30',
          type: 'line',
          data: calculateMA(30),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        }
      ]
    }

    myChart.setOption(option)

    // 监听窗口大小变化，自动调整图表大小
    window.addEventListener('resize', () => {
      myChart.resize()
    })

    // 初始化雷达图
    if (radarChart.value) {
      const radarChartInstance = echarts.init(radarChart.value)

      const radarOption = {
        title: {
          text: '转化率'
        },
        legend: {
          data: ['Allocated Budget', 'Actual Spending']
        },
        radar: {
          // shape: 'circle',
          indicator: [
            { name: 'Sales', max: 6500 },
            { name: 'Administration', max: 16000 },
            { name: 'Information Technology', max: 30000 },
            { name: 'Customer Support', max: 38000 },
            { name: 'Development', max: 52000 },
            { name: 'Marketing', max: 25000 }
          ]
        },
        series: [
          {
            name: 'Budget vs spending',
            type: 'radar',
            data: [
              {
                value: [4200, 3000, 20000, 35000, 50000, 18000],
                name: 'Allocated Budget'
              },
              {
                value: [5000, 14000, 28000, 26000, 42000, 21000],
                name: 'Actual Spending'
              }
            ]
          }
        ]
      }

      radarChartInstance.setOption(radarOption)

      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        radarChartInstance.resize()
      })
    }

    // 初始化柱状图（第二个图表）
    if (chart2.value) {
      const chart2Instance = echarts.init(chart2.value)

      // 处理后端数据（第一个数据类型）
      let chart2XAxis: string[] = []
      let chart2SeriesData: number[] = []
      let chart2SeriesName: string = '销量'

      // 如果后端有数据，使用后端数据
      // 第一个数据格式: { xAxis: { data: [...] }, series: [{ name: '...', data: [...] }] }
      if (echartsData && echartsData.list && echartsData.list.length > 0) {
        // 查找第一个数据项（简单柱状图格式）
        const firstItem = echartsData.list.find((item: any) => item.xAxis && item.series)
        if (firstItem) {
          chart2XAxis = firstItem.xAxis.data || []
          chart2SeriesData = firstItem.series[0]?.data || []
          chart2SeriesName = firstItem.series[0]?.name || '销量'
        }
      }

      // 如果没有后端数据，使用默认数据
      if (chart2XAxis.length === 0) {
        chart2XAxis = ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        chart2SeriesData = [5, 20, 36, 10, 10, 20]
      }

      const chart2Option = {
        title: {
          text: chart2SeriesName
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: chart2XAxis,
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: chart2SeriesName,
            type: 'bar',
            barWidth: '60%',
            data: chart2SeriesData,
            itemStyle: {
              color: '#5470c6'
            }
          }
        ]
      }

      chart2Instance.setOption(chart2Option)

      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        chart2Instance.resize()
      })
    }

    // 初始化南丁格尔玫瑰图（第三个图表）
    if (chart3.value) {
      const chart3Instance = echarts.init(chart3.value)

      // 处理后端数据
      let roseData: any[] = [
        { value: 120, name: 'Mon' },
        { value: 100, name: 'Tue' },
        { value: 110, name: 'Wed' },
        { value: 90, name: 'Thu' },
        { value: 80, name: 'Fri' },
        { value: 100, name: 'Sat' },
        { value: 110, name: 'Sun' }
      ]
      let lineData: number[] = [150, 230, 224, 218, 135, 147, 260]
      let categories: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      let chart3Title: string = '成交占比'

      // 如果后端有数据，使用后端数据
      // 第二个数据格式: { dataset: { source: [[name, val1, val2, type, val3], ...] } }
      if (echartsData && echartsData.list && echartsData.list.length > 0) {
        // 查找第二个数据项（dataset 格式）
        const secondItem = echartsData.list.find((item: any) => item.dataset && item.dataset.source)
        if (secondItem && secondItem.dataset && secondItem.dataset.source) {
          const source = secondItem.dataset.source
          // source 格式: [['衬衫', 5, 15, 'Search Engine', 1048], ...]
          categories = source.map((item: any[]) => item[0] || 'Unknown')
          roseData = source.map((item: any[]) => ({
            value: item[1] || 0,
            name: item[0] || 'Unknown'
          }))
          // 使用第三个值作为折线图数据
          lineData = source.map((item: any[]) => item[2] || 0)
          // 如果有标题字段，使用标题
          chart3Title = secondItem.title || '成交占比'
        }
      }

      const chart3Option = {
        title: {
          text: chart3Title,
          left: 'left'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        toolbox: {
          show: true,
          feature: {
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          },
          right: 20
        },
        legend: {
          data: ['成交占比', '趋势线'],
          bottom: 0,
          icon: 'roundRect'
        },
        polar: {
          radius: ['15%', '75%']
        },
        angleAxis: {
          type: 'category',
          data: categories,
          startAngle: 75,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#fff',
              width: 2
            }
          },
          axisLabel: {
            interval: 0,
            fontSize: 12
          }
        },
        radiusAxis: {
          min: 0,
          max: 250,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: true,
            fontSize: 10
          },
          splitLine: {
            show: false
          }
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisLine: {
            show: true
          },
          axisTick: {
            show: true
          },
          axisLabel: {
            show: true
          },
          splitLine: {
            show: true
          }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 250,
          axisLine: {
            show: true
          },
          axisTick: {
            show: true
          },
          axisLabel: {
            show: true
          },
          splitLine: {
            show: true
          }
        },
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
        series: [
          // 玫瑰图 - 使用单个系列，数据包含所有类别
          {
            type: 'bar',
            data: roseData,
            name: '成交占比',
            coordinateSystem: 'polar',
            roseType: 'radius',
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              borderRadius: 5
            }
          },
          {
            type: 'line',
            data: lineData,
            name: '趋势线',
            coordinateSystem: 'cartesian2d',
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 2,
              color: '#5470c6'
            },
            itemStyle: {
              color: '#5470c6'
            }
          }
        ]
      }

      chart3Instance.setOption(chart3Option)

      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        chart3Instance.resize()
      })
    }
  }
})
</script>

<style scoped lang="scss">
.card-container {
  display: flex;
  gap: 20px;
  width: 100%;
  flex-wrap: nowrap;

  .stats-card {
    flex: 1;
    min-width: 0;
    transition: all 0.3s ease;

    .card-content {
      display: flex;
      flex-direction: column;
      padding: 20px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        .card-title {
          font-size: 14px;
          color: var(--el-text-color-secondary, #909399);
        }

        .card-period {
          font-size: 14px;
          color: var(--el-text-color-secondary, #909399);
        }
      }

      .card-divider {
        height: 1px;
        background-color: var(--el-border-color, #ebeef5);
        margin-bottom: 20px;
      }

      .card-body {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .card-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--el-text-color-primary, #303133);
        }

        .card-icon {
          .icon {
            font-size: 24px;
            color: #667eea;
          }
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-subtitle {
          font-size: 14px;
          color: var(--el-text-color-secondary, #909399);
        }

        .card-total {
          font-size: 14px;
          color: var(--el-text-color-primary, #303133);
          font-weight: 500;
        }
      }
    }
  }
}

.echarts-container {
  width: 100%;
  height: 400px;
  margin-top: 20px;
}

.charts-wrapper {
  display: flex;
  gap: 20px;
  width: 100%;
  margin-top: 20px;
  flex-wrap: wrap;

  .chart-box {
    flex: 1;
    min-width: 300px;
    height: 400px;
    background-color: var(--el-bg-color, #fff);
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

// 响应式布局
@media (max-width: 768px) {
  .card-container {
    flex-wrap: wrap;

    .stats-card {
      flex: 1 1 calc(50% - 10px);
      margin-bottom: 20px;
    }
  }
}

@media (max-width: 480px) {
  .card-container {
    flex-direction: column;

    .stats-card {
      flex: 1 1 100%;
    }
  }
}
</style>
