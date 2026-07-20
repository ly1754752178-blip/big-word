import { useEffect } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatBar } from '@/components/ui/StatBar';
import {
  User,
  Heart,
  Brain,
  Activity,
  Stethoscope,
  Sparkles,
  Fingerprint,
  Award,
  FileBadge,
  Ruler,
  Weight,
  Baby,
  Cake,
  MapPin,
  Home,
} from 'lucide-react';

interface FieldGroupProps {
  children: React.ReactNode;
  className?: string;
}

function FieldGroup({ children, className = '' }: FieldGroupProps) {
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 py-4 px-5 border-b border-slate-100 last:border-b-0 ${className}`}>
      {children}
    </div>
  );
}

interface FieldProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function Field({ icon, label, value }: FieldProps) {
  return (
    <div className="flex items-center gap-3 min-w-[7.5rem]">
      <span className="text-slate-400">{icon}</span>
      <div>
        <dt className="text-xs text-slate-400">{label}</dt>
        <dd className="text-sm font-medium text-slate-700">{value}</dd>
      </div>
    </div>
  );
}

export function PersonalStatusOverlay() {
  const { state, addNotification } = useGame();
  const { player } = state;

  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        type: 'info',
        title: '个人状态已更新',
        message: '旧的身体状态字段已移除，当前显示最新身体档案。',
        duration: 4000,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [addNotification]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* 身份锚点区 */}
      <GlassCard
        id="personal-status-identity-card"
        variant="floating"
        className="relative overflow-hidden p-6 md:p-8"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-status-coral via-accent-teal to-accent-green" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
          {/* 头像 */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-coral-100 to-coral-200 border-4 border-white shadow-soft flex items-center justify-center overflow-hidden shrink-0">
            <User className="w-10 h-10 md:w-12 md:h-12 text-coral-400" />
          </div>

          {/* 身份信息 */}
          <div className="flex-1 min-w-0 w-full">
            <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-800">
                {player.name}
              </h2>
              <p className="text-sm text-slate-500">
                {player.socialIdentity} · {player.age}岁
              </p>
            </header>

            {/* 状态条 */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <StatBar
                id="personal-status-stamina"
                label="体力"
                value={player.status.stamina}
                color="#E87A5D"
                icon={<Heart className="w-4 h-4" />}
              />
              <StatBar
                id="personal-status-mental"
                label="精神"
                value={player.status.mental}
                color="#38BDF8"
                icon={<Brain className="w-4 h-4" />}
              />
              <StatBar
                id="personal-status-health"
                label="健康"
                value={player.status.health}
                color="#6BBF73"
                icon={<Activity className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 身体状态区 */}
      <section id="personal-status-body-section">
        <GlassCard variant="default" className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <Activity className="w-5 h-5 text-coral-400" />
            <h3 className="font-heading text-base font-bold text-slate-800">身体状态</h3>
          </div>

          <dl>
            {/* 基础测量 */}
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-3">
              <Field icon={<Ruler className="w-4 h-4" />} label="身高" value={`${player.bodyState.height} cm`} />
              <Field icon={<Weight className="w-4 h-4" />} label="体重" value={`${player.bodyState.weight} 斤`} />
              <Field icon={<Baby className="w-4 h-4" />} label="年龄阶段" value={player.bodyState.ageStage} />
            </FieldGroup>

            {/* 生理与精神标签 */}
            <FieldGroup>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-mint-500" />
                  <span className="text-xs text-slate-400">生理</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {player.bodyState.physiological.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-full bg-mint-50 text-mint-600 text-xs font-medium border border-mint-100"
                    >
                      {item}
                    </span>
                  ))}
                  {player.bodyState.physiological.length === 0 && (
                    <span className="text-sm text-slate-600">无异常</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span className="text-xs text-slate-400">精神</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {player.bodyState.mental.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-medium border border-sky-100"
                    >
                      {item}
                    </span>
                  ))}
                  {player.bodyState.mental.length === 0 && (
                    <span className="text-sm text-slate-600">平稳</span>
                  )}
                </div>
              </div>
            </FieldGroup>

            {/* 综合描述 */}
            <FieldGroup className="!border-b-0">
              <p className="text-sm text-slate-600 leading-relaxed w-full">
                {player.bodyState.description}
              </p>
            </FieldGroup>
          </dl>
        </GlassCard>
      </section>

      {/* 个人讯息区 */}
      <section id="personal-status-info-section">
        <GlassCard variant="default" className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <Fingerprint className="w-5 h-5 text-sky-500" />
            <h3 className="font-heading text-base font-bold text-slate-800">个人讯息</h3>
          </div>

          <dl>
            <FieldGroup>
              <Field icon={<User className="w-4 h-4" />} label="姓名" value={player.name} />
              <Field icon={<User className="w-4 h-4" />} label="性别" value={player.gender} />
              <Field icon={<Baby className="w-4 h-4" />} label="年龄" value={`${player.age}岁`} />
            </FieldGroup>

            <FieldGroup>
              <Field icon={<Cake className="w-4 h-4" />} label="生日" value={player.birthday} />
              <Field icon={<MapPin className="w-4 h-4" />} label="国籍" value={player.nationality} />
              <Field icon={<Home className="w-4 h-4" />} label="户籍" value={player.householdRegistration} />
            </FieldGroup>

            <FieldGroup>
              <Field icon={<Sparkles className="w-4 h-4" />} label="母语" value={player.nativeLanguage} />
              <Field icon={<Award className="w-4 h-4" />} label="社会身份" value={player.socialIdentity} />
            </FieldGroup>

            <FieldGroup>
              <Field icon={<User className="w-4 h-4" />} label="家庭成员" value={player.familyMembers} />
            </FieldGroup>

            <FieldGroup className="!border-b-0">
              <Field icon={<MapPin className="w-4 h-4" />} label="住址" value={player.address} />
            </FieldGroup>
          </dl>
        </GlassCard>
      </section>

      {/* 资质与荣誉区 */}
      <section id="personal-status-awards-section">
        <GlassCard variant="default" className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-heading text-base font-bold text-slate-800">资质与荣誉</h3>
          </div>

          <dl>
            <FieldGroup>
              <Field
                icon={<FileBadge className="w-4 h-4" />}
                label="证件证书"
                value={player.certificates.join('、') || '无'}
              />
            </FieldGroup>

            <FieldGroup className="!border-b-0">
              <Field
                icon={<Award className="w-4 h-4" />}
                label="奖项成就"
                value={player.awards.join('、') || '无'}
              />
            </FieldGroup>
          </dl>
        </GlassCard>
      </section>
    </div>
  );
}
