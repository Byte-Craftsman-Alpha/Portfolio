import { useState } from 'react';
import { personal } from '../data/portfolio';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';

// ─── Interactive footer link ──────────────────────────────────────────

function FooterLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const reduced = useReducedMotion();

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.9 }}
      animate={{
        color: isHovered ? '#2c2c2c' : '#8a8580',
        y: isHovered && !reduced ? -2 : 0,
      }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label={label}
    >
      <motion.div animate={{ rotate: isHovered ? 15 : 0 }} transition={{ duration: 0.2 }}>
        <Icon icon={icon} width={18} />
      </motion.div>
    </motion.a>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-hairline" role="contentinfo">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-charcoal mb-1">{personal.name}</p>
            <p className="text-xs text-taupe">{personal.role}</p>
          </div>
          <div className="flex items-center gap-6">
            <FooterLink href={personal.github} icon="solar:code-square-linear" label="GitHub" />
            <FooterLink href={personal.linkedin} icon="solar:link-round-linear" label="LinkedIn" />
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-hairline flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[11px] text-taupe">{currentYear} {personal.name}. Built with care.</p>
          <p className="text-[11px] text-taupe">No invented credentials. Honest labeling throughout.</p>
        </div>
      </div>
    </footer>
  );
}
