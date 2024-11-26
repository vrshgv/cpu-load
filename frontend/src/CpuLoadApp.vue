<template>
  <div class="wrapper">
    <div class="wrapper-info">
      <p>Current average CPU load: {{ currentLoad.load || '' }} {{ currentLoad.formattedDate || '' }}</p>
      <p v-if="currentHighLoadStartDate" class="p-red">
        Now high average CPU load going from: {{ formatDate(currentHighLoadStartDate) }}
      </p>
      <p class="p-red">
        High average CPU load events: {{ cpuHighLoadPeriods.length || 'N/A' }}
      </p>
      <ul v-if="cpuHighLoadPeriods.length">
        <li v-for="(period, idx) in cpuHighLoadPeriods" :key="idx">
          {{ formatDate(period.start) }} 
          - {{ formatDate(period.end) }}
        </li>
      </ul>
      <p class="p-green">
        Recovered average CPU load events: {{ cpuRecoveryPeriods.length || 'N/A' }}
      </p>
      <ul v-if="cpuRecoveryPeriods.length">
        <li v-for="(period, idx) in cpuRecoveryPeriods" :key="idx">
          {{ formatDate(period.start) }} 
          - {{ formatDate(period.end) }}
        </li>
      </ul>
    </div>
    <apex-charts type="line" :options="chartOptions" :series="chartSeries" height="500px" width="800px" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import ApexCharts from 'vue3-apexcharts';
  import { getHighCpuLoadData } from './utils/cpuLoadAnalyze';
  import { formatDate } from './utils/date';
  import { SeriesData } from './types/seriesData';
  import { DatePeriod } from './types/period';

  const currentLoad = ref<{ load?: number; formattedDate?: string }>({});
  const cpuHighLoadPeriods = ref<DatePeriod[]>([]);
  const cpuRecoveryPeriods = ref<DatePeriod[]>([]);
  const currentHighLoadStartDate = ref();

  //Initialize chart series and options
  const chartSeries = ref<[{ name: string, data: SeriesData[] }]>([{ name: 'CPU Load', data: [] }]);
  const chartOptions = ref({
    chart: {
      id: 'cpu-load-monitoring-chart',
      animations: { enabled: false }, 
      zoom: { enabled: false }
    },
    xaxis: {
      title: { text: 'Time' },
      type: 'datetime',
      labels: {
        format: 'HH:mm:ss',
      }
    },
    yaxis: {
      title: { text: 'CPU Load' },
      min: 0
    },
    colors: ['#6427C9'],
    tooltip: { x: { format: 'HH:mm:ss' } },
    title: { text: 'CPU Load Monitoring', align: 'center' }
  });

  const updateCpuLoadStats = (seriesData: SeriesData[]) => {
    const { highLoadPeriods, recoveryPeriods, ongoingHighLoadStartDate } = getHighCpuLoadData(seriesData);
    cpuHighLoadPeriods.value = highLoadPeriods;
    cpuRecoveryPeriods.value = recoveryPeriods;
    currentHighLoadStartDate.value = ongoingHighLoadStartDate;
  };

  const updateChartSeriesData = (seriesData: SeriesData) => {
    //Update chart series
    chartSeries.value[0].data.push(seriesData);

    //Remove data that older than 10 minutes 
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    if (chartSeries.value[0].data[0].x.getTime() < tenMinutesAgo) {
      chartSeries.value[0].data.shift();
    }

    //Analize updated data for high load and recovery periods
    updateCpuLoadStats(chartSeries.value[0].data);
  };

  const fetchCpuLoad = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cpu');
      const data = await response.json();
      const load = data.load.toFixed(2);
      const date = new Date(data.timestamp);

      currentLoad.value = { load, formattedDate: formatDate(date) };

      updateChartSeriesData({ x: date, y: load });
    } catch (error) {
      console.error(error);
    }
  };

  onMounted(async() => {
    await fetchCpuLoad();
    setInterval(fetchCpuLoad, 10000); //every 10 seconds
  });
</script>

<style scoped>
  .wrapper {
    display: flex;
    align-items: start;
    gap: 25px;
  }

  .wrapper-info {
    text-align: left;
  }

  p {
    margin: 5px 0;
  }

  .p-green {
    color: #42B883;
  }

  .p-red {
    color: #FF6B6B;
  }
</style>

