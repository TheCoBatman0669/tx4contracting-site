import {
  Building2,
  Wrench,
  HardHat,
  Truck,
  ShieldCheck,
  ClipboardList,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  Shield,
  Clock,
  FileCheck,
  Target,
  MapPin,
  Handshake,
  Layers,
  Landmark,
  Siren,
  Recycle,
  Ruler,
  PackageSearch,
  Hammer,
  Zap,
  Gauge,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Wrench,
  HardHat,
  Truck,
  ShieldCheck,
  ClipboardList,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  Shield,
  Clock,
  FileCheck,
  Target,
  MapPin,
  Handshake,
  Layers,
  Landmark,
  Siren,
  Recycle,
  Ruler,
  PackageSearch,
  Hammer,
  Zap,
  Gauge,
};

interface IconProps {
  name: string;
  className?: string;
}

/**
 * Renders a Lucide icon by name so that content data files can stay
 * plain serialisable data instead of holding JSX.
 * Falls back to a generic icon when the name is unknown.
 */
export function Icon({ name, className }: IconProps) {
  const Component = iconMap[name] ?? Wrench;
  return <Component className={className} aria-hidden="true" />;
}
