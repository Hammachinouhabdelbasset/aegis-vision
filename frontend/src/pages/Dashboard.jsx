import { AlertBanner } from '../components/cards/AlertBanner';
import { LiveFeed } from '../components/cards/LiveFeed';
import { DrowsinessCard } from '../components/cards/DrowsinessCard';
import { YawnCard } from '../components/cards/YawnCard';
import { HeadPoseCard } from '../components/cards/HeadPoseCard';
import { GazeCard } from '../components/cards/GazeCard';
import { PhoneCard } from '../components/cards/PhoneCard';

function getLevel(sim) {
  if (sim.phoneAlert || sim.drowsyScore > 70) return 'CRITICAL';
  if (sim.drowsyScore > 45 || sim.gazeAlert) return 'ALERT';
  if (sim.drowsyScore > 25 || sim.nodding || sim.yawning) return 'WARNING';
  return 'OK';
}

export const Dashboard = ({ monitorState: sim, isConnected, uptime }) => {
  const level = getLevel(sim);

  return (
    <div className="p-5 animate-fade-in">
      {/* Status line */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[9px] font-mono tracking-widest" style={{ color: '#5a5a6a' }}>
          SEC_LAYER_01 // {isConnected ? 'RUNNING' : 'SIMULATION'}
        </span>
        <div className="w-1 h-1 rounded-full animate-pulse-slow" style={{ background: '#00d68f' }} />
      </div>

      <AlertBanner level={level} uptime={uptime} />

      <div className="grid grid-cols-12 gap-3">
        <LiveFeed pitch={sim.pitch ?? 0} yaw={sim.yaw ?? 0} roll={sim.roll ?? 0} />
        <DrowsinessCard
          drowsyScore={sim.drowsyScore ?? 0}
          ear={sim.ear ?? 0.3}
          earHistory={sim.earHistory ?? Array(12).fill(0.3)}
          perclos={sim.perclos ?? 0}
        />
        <YawnCard yawning={sim.yawning ?? false} mar={sim.mar ?? 0.14} yawnCount={sim.yawnCount ?? 0} />
        <HeadPoseCard pitch={sim.pitch ?? 0} yaw={sim.yaw ?? 0} roll={sim.roll ?? 0} nodding={sim.nodding ?? false} />
        <GazeCard gazeDir={sim.gazeDir ?? 'FORWARD'} gazeAlert={sim.gazeAlert ?? false} gazeOff={sim.gazeOff ?? 0} />
        <PhoneCard
          phoneDetected={sim.phoneDetected ?? false}
          phoneAlert={sim.phoneAlert ?? false}
          phoneDuration={sim.phoneDuration ?? 0}
          phoneViolations={sim.phoneViolations ?? 0}
        />
      </div>
    </div>
  );
};
