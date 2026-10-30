import { Building2, Target, Users, Workflow, MessagesSquare, ListChecks, UserRoundCheck, Cable, Files, Palette, ShieldCheck, GitBranch, LockKeyhole, Sparkles, Boxes, Play, CircleCheck, Network, Rocket, ChartNoAxesCombined, Database, Zap, HeartHandshake, Settings, TrendingUp, Megaphone, Ellipsis } from 'lucide-react';
const icons = [Building2,Target,Users,Workflow,MessagesSquare,ListChecks,UserRoundCheck,Cable,Files,Palette,ShieldCheck,GitBranch,LockKeyhole,Sparkles,Boxes,Play,CircleCheck,Network,Rocket];
const goalIcons = [ChartNoAxesCombined,Database,Zap,HeartHandshake,Settings,TrendingUp,Users,Rocket,ChartNoAxesCombined,Megaphone,Database,ShieldCheck,Ellipsis];
export function GoalIcon({index}: {index:number}) { const Icon=goalIcons[index]||Target;return <Icon size={18}/>; }
export function ProcessIcon({name}: {name:string}) {
  const Icon=/scope|period|plan/i.test(name)?ListChecks:/collect|source|data/i.test(name)?Database:/reconcile|handoff|connect/i.test(name)?GitBranch:/exception|security|risk/i.test(name)?ShieldCheck:/sign.off|approval|review/i.test(name)?UserRoundCheck:/archive|record|report|statement/i.test(name)?Files:/code|implementation|build/i.test(name)?Settings:Workflow;
  return <span className="process-semantic-icon" aria-hidden="true"><Icon size={23}/></span>;
}
const previews = [
  ['Company profile', 'Your story', 'Your market', 'Your products'],
  ['A shared direction', 'Choose a goal', 'Define success', 'Set a measure'],
  ['Your people map', 'Teams', 'Roles', 'Decision makers'],
  ['Work, connected', 'A request arrives', 'The team responds', 'An outcome follows'],
  ['Your business story', 'What starts the work?', 'What gets in the way?', 'What does good look like?'],
  ['A process blueprint', 'Intake', 'Prepare', 'Review'],
  ['Clear ownership', 'Who prepares?', 'Who reviews?', 'Who decides?'],
  ['Your connected stack', 'Daily tools', 'Shared systems', 'Access to configure'],
  ['A knowledge foundation', 'Company context', 'Source documents', 'Process knowledge'],
  ['Recognizably yours', 'Voice & tone', 'Visual identity', 'Brand principles'],
  ['Your operating standards', 'Always do', 'Never do', 'Review first'],
  ['People at the right moment', 'AI prepares', 'A person reviews', 'You approve'],
  ['Boundaries by design', 'Draft first', 'Scope access', 'Approve actions'],
  ['Room for better work', 'Repeatable tasks', 'Useful assistance', 'People in control'],
  ['Your starting lineup', 'Pick a Pod', 'Give it a purpose', 'Review its scope'],
  ['A safe rehearsal', 'Sample request', 'Walk the process', 'Inspect checkpoints'],
  ['Ready, with confidence', 'Check the essentials', 'Resolve the gaps', 'Review together'],
  ['One living blueprint', 'Company', 'People & processes', 'Rules & context'],
  ['A new way to work', 'Review your choices', 'Activate your company', 'Define an outcome'],
];
export function OnboardingVisual({ step }: { step: number }) {
  const preview = previews[step] || previews[0];
  const Icon = icons[step] || Sparkles;
  return <div className="setup-preview" aria-hidden="true">
    <div className="setup-preview-orbit"/><div className="setup-preview-sheet back"/>
    <div className="setup-preview-sheet front"><div className="setup-preview-top"><span/><span/><span/><small>YOUR BLUEPRINT</small></div>
      <div className="setup-preview-title"><span><Icon size={25}/></span><b>{preview[0]}</b></div>
      {preview.slice(1).map((text,i)=><div className="setup-preview-row" key={text}><span>{String(i+1).padStart(2,'0')}</span><span>{text}</span><i/></div>)}
    </div><span className="setup-preview-caption">Built around your business</span>
  </div>;
}
