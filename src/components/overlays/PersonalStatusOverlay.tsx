import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatBar } from '@/components/ui/StatBar';
import {
  User,
  Heart,
  Activity,
  Brain,
  Fingerprint,
  Home,
  Cake,
  MapPin,
  Ruler,
  Weight,
  Baby,
  Stethoscope,
  Sparkles,
  Award,
  FileBadge,
} from 'lucide-react';

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 border border-status-salmon/20">
      <div className="w-10 h-10 rounded-xl bg-status-coral/15 flex items-center justify-center text-status-coral shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-text-muted block mb-0.5">{label}</span>
        <span className="text-base text-text-primary leading-snug">{value}</span>
      </div>
    </div>
  );
}

export function PersonalStatusOverlay() {
  const { state } = useGame();
  const { player } = state;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 身份证大卡 */}
      <GlassCard variant="floating" className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-status-coral via-status-salmon to-accent-amber" />
        <div className="absolute top-4 right-4 text-xs font-number text-text-muted tracking-widest">
          ID CARD · {player.socialIdentity}
        </div>

        <div className="absolute right-8 top-8 bottom-8 w-24 holographic-stripe opacity-60" />

        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-status-coral/25 to-status-salmon/25 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden"
          >
            <User className="w-14 h-14 text-status-coral" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
              {player.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-status-coral/15 text-status-coral text-sm font-medium border border-status-coral/20">
                {player.bodyState.label}
              </span>
              <span className="px-3 py-1 rounded-full bg-status-salmon/15 text-text-secondary text-sm border border-status-salmon/20">
                {player.bodyState.mood}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatBar label="体力" value={player.status.stamina} color="bg-status-coral" icon={<Heart className="w-4 h-4" />} />
              <StatBar label="精神" value={player.status.mental} color="bg-accent-teal" icon={<Brain className="w-4 h-4" />} />
              <StatBar label="健康" value={player.status.health} color="bg-accent-green" icon={<Activity className="w-4 h-4" />} />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 身体状态 */}
        <GlassCard variant="default" className="p-5 module-card-status">
          <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-status-coral" /> 身体状态
          </h3>

          <div className="space-y-3">
            <InfoRow icon={<Ruler className="w-5 h-5" />} label="身高" value={`${player.bodyState.height} cm`} />
            <InfoRow icon={<Weight className="w-5 h-5" />} label="体重" value={`${player.bodyState.weight} 斤`} />
            <InfoRow icon={<Baby className="w-5 h-5" />} label="年龄阶段" value={player.bodyState.ageStage} />
            <InfoRow
              icon={<Stethoscope className="w-5 h-5" />}
              label="生理状态"
              value={player.bodyState.physiological.join('、') || '无异常'}
            />
            <InfoRow
              icon={<Sparkles className="w-5 h-5" />}
              label="精神状态"
              value={player.bodyState.mental.join('、') || '平稳'}
            />
          </div>

          <div className="mt-5 pt-5 border-t border-border-soft/60">
            <StatBar label="疲劳" value={player.bodyState.fatigue} color="bg-status-coral" />
            <div className="flex flex-wrap gap-2 mt-4">
              {player.bodyState.conditions.map((condition) => (
                <span
                  key={condition}
                  className="px-3 py-1.5 rounded-full bg-status-coral/15 text-status-coral text-xs font-medium border border-status-coral/20"
                >
                  {condition}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-text-secondary leading-relaxed">{player.bodyState.description}</p>
          </div>
        </GlassCard>

        {/* 个人资讯 */}
        <GlassCard variant="default" className="p-5 module-card-status">
          <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 mb-4">
            <Fingerprint className="w-5 h-5 text-status-coral" /> 个人讯息
          </h3>

          <div className="space-y-3">
            <InfoRow icon={<User className="w-5 h-5" />} label="姓名" value={player.name} />
            <InfoRow icon={<User className="w-5 h-5" />} label="性别" value={player.gender} />
            <InfoRow icon={<Baby className="w-5 h-5" />} label="年龄" value={`${player.age}岁`} />
            <InfoRow icon={<Cake className="w-5 h-5" />} label="生日" value={player.birthday} />
            <InfoRow icon={<MapPin className="w-5 h-5" />} label="国籍" value={player.nationality} />
            <InfoRow icon={<Home className="w-5 h-5" />} label="户籍" value={player.householdRegistration} />
            <InfoRow icon={<Sparkles className="w-5 h-5" />} label="母语" value={player.nativeLanguage} />
            <InfoRow icon={<Award className="w-5 h-5" />} label="社会身份" value={player.socialIdentity} />
            <InfoRow icon={<Home className="w-5 h-5" />} label="家庭成员" value={player.familyMembers} />
            <InfoRow icon={<MapPin className="w-5 h-5" />} label="住址" value={player.address} />
            <InfoRow icon={<FileBadge className="w-5 h-5" />} label="证件证书" value={player.certificates.join('、') || '无'} />
            <InfoRow icon={<Award className="w-5 h-5" />} label="奖项成就" value={player.awards.join('、') || '无'} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
