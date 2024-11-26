import { getHighCpuLoadData } from './cpuLoadAnalyze';

const MS_1_MIN = 60000;

const MS_2_MIN = MS_1_MIN * 2;
const MS_3_MIN = MS_1_MIN * 3;
const MS_4_MIN = MS_2_MIN * 2;
const MS_6_MIN = MS_3_MIN * 2;
const MS_12_MIN = MS_6_MIN * 2;

describe('getHighCpuLoadData', () => {
  it('returns no high load and recovery periods when the load data values are low', () => {
    const now = Date.now();

    const data = [
      { x: new Date(now - MS_6_MIN), y: 0.85 }, //low load values
      { x: new Date(now - MS_4_MIN), y: 0.55 },
      { x: new Date(now - MS_2_MIN), y: 0.70 },
      { x: new Date(now), y: 1.00 }
    ];

    const result = getHighCpuLoadData(data);

    expect(result.highLoadPeriods).toHaveLength(0);
    expect(result.recoveryPeriods).toHaveLength(0);
    expect(result.ongoingHighLoadStartDate).toBeNull();
  });

  it('returns no periods and no ongoing high load event, since no load data persisted 2 mins', () => {
    const now = Date.now();

    const data = [
      { x: new Date(now - MS_4_MIN), y: 0.50 }, 
      { x: new Date(now - MS_3_MIN), y: 1.61 }, 
      { x: new Date(now - MS_2_MIN + 5000), y: 0.75 }, //high load didn't last to be registered
      { x: new Date(now), y: 1.00 }                   
    ];

    const result = getHighCpuLoadData(data);

    expect(result.highLoadPeriods).toHaveLength(0);
    expect(result.recoveryPeriods).toHaveLength(0);
    expect(result.ongoingHighLoadStartDate).toBeNull();
  });
  
  it('returns one high load event period and one recovery event period', () => {
    const now = Date.now();

    const data = [
      { x: new Date(now - MS_6_MIN), y: 1.22 }, 
      { x: new Date(now - MS_3_MIN), y: 1.61 }, 
      { x: new Date(now - MS_2_MIN), y: 0.75 }, //start of a recovery
      { x: new Date(now), y: 0.35 }                   
    ];

    const result = getHighCpuLoadData(data);

    expect(result.highLoadPeriods).toHaveLength(1);
    expect(result.recoveryPeriods).toHaveLength(1);
    expect(result.ongoingHighLoadStartDate).toBeNull();
  });

  it('returns an ongoing high load event date, no stored load and recovery periods', () => {
    const now = Date.now();

    const data = [
      { x: new Date(now - MS_6_MIN), y: 0.45 }, 
      { x: new Date(now - MS_3_MIN), y: 1.22 }, //ongoing high load 
      { x: new Date(now - MS_2_MIN), y: 1.61 }, 
      { x: new Date(now - MS_1_MIN), y: 1.75 },
      { x: new Date(now), y: 1.35 }                   
    ];

    const result = getHighCpuLoadData(data);

    expect(result.highLoadPeriods).toHaveLength(0);
    expect(result.recoveryPeriods).toHaveLength(0);
    expect(result.ongoingHighLoadStartDate).toBeTruthy();
  });

  it('returns two high load events period and one recovery event period', () => {
    const now = Date.now();

    const data = [
      { x: new Date(now - MS_12_MIN), y: 1.97 }, //high load
      { x: new Date(now - MS_6_MIN), y: 1.32 },  //high load
      { x: new Date(now - MS_4_MIN), y: 1.00 },  //recovery, high load event stored
      { x: new Date(now - MS_3_MIN), y: 0.2 },   //recovery
      { x: new Date(now - MS_2_MIN), y: 1.25 },  //high load, recovery event stored
      { x: new Date(now - MS_1_MIN), y: 1.75 },  //high load
      { x: new Date(now), y: 0.10 }              //no recovery, not 2 mins
    ];

    const result = getHighCpuLoadData(data);

    expect(result.highLoadPeriods).toHaveLength(2); 
    expect(result.recoveryPeriods).toHaveLength(1); 
    expect(result.ongoingHighLoadStartDate).toBeNull();
  });

  it('returns one high load event period, one recovery event period, and ongoing high load event', () => {
    const now = Date.now();

    const data = [
      { x: new Date(now - MS_12_MIN), y: 0.97 }, 
      { x: new Date(now - MS_6_MIN), y: 1.32 },  //high load
      { x: new Date(now - MS_4_MIN), y: 1.00 },  //recovery, high load event stored
      { x: new Date(now - MS_3_MIN), y: 0.20 },  //recovery
      { x: new Date(now - MS_2_MIN), y: 1.25 },  //high load, recovery event stored
      { x: new Date(now - MS_1_MIN), y: 1.75 },  //high load
      { x: new Date(now), y: 1.10 }              //ongoing high load event
    ];

    const result = getHighCpuLoadData(data);

    expect(result.highLoadPeriods).toHaveLength(1); 
    expect(result.recoveryPeriods).toHaveLength(1); 
    expect(result.ongoingHighLoadStartDate).toBeTruthy();
  });
});
