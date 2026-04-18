import { useEffect, useMemo, useState } from 'react';
import { WindFarmSimulator } from '@/mock/simulator';
import type { FarmState } from '@/mock/types';

export const useSimulator = (running: boolean, speed: number) => {
  const simulator = useMemo(() => new WindFarmSimulator(), []);
  const [farm, setFarm] = useState<FarmState>(simulator.state);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setFarm(simulator.step(speed));
    }, 1000 / speed);
    return () => clearInterval(timer);
  }, [running, speed, simulator]);

  return farm;
};
