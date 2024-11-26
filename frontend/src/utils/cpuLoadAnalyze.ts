import { SeriesData } from '../types/seriesData';
import { DatePeriod } from '../types/period';
import { getDuration } from './date';

const MAX_HIGH_LOAD = 1;
const MAX_HIGH_LOAD_DURATION_MS = 2 * 60 * 1000; //2 mins

export function getHighCpuLoadData(cpuData: SeriesData[]): {
  highLoadPeriods: DatePeriod[];
  recoveryPeriods: DatePeriod[];
  ongoingHighLoadStartDate: Date | null;
} {
  const highLoadPeriods = [];
  const recoveryPeriods = [];

  let highLoadStartDate = null;
  let recoveryStartDate = null;
  let ongoingHighLoadStartDate = null;

  for (let i = 0; i < cpuData.length; i++) {
    const loadData = cpuData[i];
    const isHighAvgLoad = loadData.y > MAX_HIGH_LOAD;

    if (isHighAvgLoad) {
      //Add high load start date if it's not present
      if (!highLoadStartDate) {
        highLoadStartDate = loadData.x;
      }

      //If the high load comes after low load (recovery period)
      //store the recovery period on a duration condition 
      if (recoveryStartDate) {
        if (getDuration(loadData.x, recoveryStartDate) >= MAX_HIGH_LOAD_DURATION_MS) {
          recoveryPeriods.push({ start: recoveryStartDate, end: loadData.x });
        }

        recoveryStartDate = null;
      }
    } else {
      //If the low load comes after high load period
      //store the high load period on a duration condition 
      if (highLoadStartDate) {
        if (getDuration(loadData.x, highLoadStartDate) >= MAX_HIGH_LOAD_DURATION_MS) {
          highLoadPeriods.push({ start: highLoadStartDate, end: loadData.x });
        }

        highLoadStartDate = null;

        if (!recoveryStartDate) {
          recoveryStartDate = loadData.x;
        }
      }
    }
  }

  //Alert about ongoing high load event 
  //if there was no recovery by the time the load data ends 
  if (highLoadStartDate && getDuration(cpuData[cpuData.length - 1].x, highLoadStartDate) >= MAX_HIGH_LOAD_DURATION_MS) {
    ongoingHighLoadStartDate = highLoadStartDate;
  }
  
  //If the load data ends with the low load (after a high load event)
  //store this recovery event also
  if (recoveryStartDate && getDuration(cpuData[cpuData.length - 1].x, recoveryStartDate) >= MAX_HIGH_LOAD_DURATION_MS) {
    recoveryPeriods.push({ start: recoveryStartDate, end: cpuData[cpuData.length - 1].x });
  }

  return {
    highLoadPeriods,
    recoveryPeriods,
    ongoingHighLoadStartDate
  };
}
