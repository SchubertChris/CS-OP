import {
  LayoutDashboard, ArrowLeftRight, BarChart2, FileText,
  Users, Target, Kanban, Archive, Lightbulb, Settings, BookOpen,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { NavItem, NavDivider } from './Nav';
import styles from './Sidebar.module.css';
import logo from '../../../assets/CandleScopeLogo.png';

interface SidebarProps {
  compact: boolean;
  onToggleCompact: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ compact, onToggleCompact, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <aside
      className={[
        styles.sidebar,
        compact ? styles.compact : '',
        mobileOpen ? styles.mobileOpen : '',
      ].join(' ')}
    >
      <div className={styles.header}>
        <img src={logo} alt="CandleScope" className={styles.logo} />
        {!compact && <span className={styles.brandName}>CandleScope</span>}
        <button
          className={styles.closeBtn}
          onClick={onMobileClose}
          aria-label="Sidebar schließen"
        >
          <X size={18} />
        </button>
      </div>

      <nav className={styles.nav}>
        <NavDivider label="Übersicht" compact={compact} />
        <NavItem to="/"                 icon={<LayoutDashboard size={18} />} label="Dashboard"      compact={compact} />
        <NavItem to="/transaktionen"    icon={<ArrowLeftRight size={18} />}  label="Transaktionen"  compact={compact} />
        <NavItem to="/jahresanalyse"    icon={<BarChart2 size={18} />}       label="Jahresanalyse"  compact={compact} />

        <NavDivider label="Planung" compact={compact} />
        <NavItem to="/vertraege"        icon={<FileText size={18} />}        label="Verträge"       compact={compact} />
        <NavItem to="/kreditoren"       icon={<Users size={18} />}           label="Kreditoren"     compact={compact} />
        <NavItem to="/sparziele"        icon={<Target size={18} />}          label="Sparziele"      compact={compact} />
        <NavItem to="/pivot"            icon={<Kanban size={18} />}          label="Pivot"          compact={compact} />
        <NavItem to="/visionboard"      icon={<Lightbulb size={18} />}       label="Vision Board"   compact={compact} />

        <NavDivider label="System" compact={compact} />
        <NavItem to="/archiv"           icon={<Archive size={18} />}         label="Archiv"         compact={compact} />
        <NavItem to="/einstellungen"    icon={<Settings size={18} />}        label="Einstellungen"  compact={compact} />
        <NavItem to="/docs"             icon={<BookOpen size={18} />}        label="Über die App"   compact={compact} />
      </nav>

      <button
        className={styles.toggleBtn}
        onClick={onToggleCompact}
        aria-label={compact ? 'Sidebar ausklappen' : 'Sidebar einklappen'}
      >
        {compact ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
