import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Icon } from '@iconify/react';
import { personal } from '../data/portfolio';
import SectionReveal from './SectionReveal';
import useReducedMotion from '../hooks/useReducedMotion';

// ─── Interactive contact row ──────────────────────────────────────────

function ContactRow({ children }: { children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const reduced = useReducedMotion();

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      animate={{
        x: isHovered && !reduced ? 3 : 0,
        scale: isPressed ? 0.99 : 1,
      }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex items-center gap-4"
    >
      {children}
    </motion.div>
  );
}

// ─── Interactive icon container ───────────────────────────────────────

function IconBox({ icon, isHovered }: { icon: string; isHovered: boolean }) {
  return (
    <motion.div
      animate={{
        borderColor: isHovered ? 'rgba(138,133,128,0.4)' : '#e8e4df',
        scale: 1,
      }}
      transition={{ duration: 0.15 }}
      className="w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: '#f5f2ed' }}
    >
      <motion.div animate={{ rotate: isHovered ? 8 : 0 }} transition={{ duration: 0.2 }}>
        <Icon icon={icon} width={18} className="text-taupe" />
      </motion.div>
    </motion.div>
  );
}

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [copyHovered, setCopyHovered] = useState(false);
  const [copyPressed, setCopyPressed] = useState(false);
  const [copyFocused, setCopyFocused] = useState(false);
  const [ghHovered, setGhHovered] = useState(false);
  const [liHovered, setLiHovered] = useState(false);
  const [resumeHovered, setResumeHovered] = useState(false);
  const [resumePressed, setResumePressed] = useState(false);
  const reduced = useReducedMotion();

  const copyScaleMV = useMotionValue(1);
  const copyScale = useSpring(copyScaleMV, { stiffness: 400, damping: 25 });

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(personal.email);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  const copyBgColor = copyPressed ? '#f0ede8' : copyHovered ? '#f5f2ed' : '#faf9f6';
  const copyBorderColor = copyFocused ? '#2c2c2c' : copyHovered ? '#8a8580' : '#e8e4df';
  const copyTextColor = copied ? '#2c2c2c' : copyError ? '#a04040' : copyHovered ? '#2c2c2c' : '#8a8580';

  return (
    <section id="contact" className="py-20 md:py-28 border-t border-hairline" aria-label="Contact">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-3">Get in Touch</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-charcoal tracking-tight mb-6">Contact</h2>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="max-w-xl">
            <p className="text-base text-stone leading-relaxed mb-8">
              Open to conversations about engineering roles, collaboration on meaningful projects, or technical discussion. Reach out through any channel below.
            </p>

            <div className="space-y-5">
              {/* Email */}
              <ContactRow>
                <IconBox icon="solar:letter-linear" isHovered={copyHovered} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-taupe uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-sm text-charcoal font-medium truncate">{personal.email}</p>
                </div>
                <motion.button
                  onClick={handleCopyEmail}
                  onHoverStart={() => setCopyHovered(true)}
                  onHoverEnd={() => setCopyHovered(false)}
                  onMouseDown={() => { copyScaleMV.set(0.95); setCopyPressed(true); }}
                  onMouseUp={() => { copyScaleMV.set(1); setCopyPressed(false); }}
                  onMouseLeave={() => { copyScaleMV.set(1); setCopyPressed(false); }}
                  onFocus={() => setCopyFocused(true)}
                  onBlur={() => setCopyFocused(false)}
                  style={{ scale: reduced ? 1 : copyScale, backgroundColor: copyBgColor, borderColor: copyBorderColor, color: copyTextColor }}
                  animate={{
                    boxShadow: copyFocused ? '0 0 0 2px #faf9f6, 0 0 0 4px #2c2c2c' : '0 0 0 0px transparent',
                  }}
                  transition={{ duration: 0.15 }}
                  className="px-3 py-1.5 text-[11px] font-medium border rounded-lg min-h-[36px] flex-shrink-0 outline-none"
                  aria-label="Copy email address"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={copied ? 'copied' : copyError ? 'error' : 'copy'}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-1.5"
                    >
                      {copied ? (
                        <><Icon icon="solar:check-circle-linear" width={14} /> Copied</>
                      ) : copyError ? (
                        <><Icon icon="solar:close-circle-linear" width={14} /> Failed</>
                      ) : (
                        <><Icon icon="solar:copy-linear" width={14} /> Copy</>
                      )}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </ContactRow>

              {/* GitHub */}
              <motion.a
                href={personal.github}
                target="_blank"
                rel="noopener noreferrer"
                onHoverStart={() => setGhHovered(true)}
                onHoverEnd={() => setGhHovered(false)}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 outline-none"
                aria-label="View GitHub profile"
              >
                <IconBox icon="solar:code-square-linear" isHovered={ghHovered} />
                <div>
                  <p className="text-[10px] text-taupe uppercase tracking-wider mb-0.5">GitHub</p>
                  <motion.p
                    className="text-sm text-charcoal font-medium"
                    animate={{ color: ghHovered ? '#8a8580' : '#2c2c2c', x: ghHovered ? 2 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {personal.githubUsername}
                  </motion.p>
                </div>
              </motion.a>

              {/* LinkedIn */}
              <motion.a
                href={personal.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onHoverStart={() => setLiHovered(true)}
                onHoverEnd={() => setLiHovered(false)}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 outline-none"
                aria-label="View LinkedIn profile"
              >
                <IconBox icon="solar:link-round-linear" isHovered={liHovered} />
                <div>
                  <p className="text-[10px] text-taupe uppercase tracking-wider mb-0.5">LinkedIn</p>
                  <motion.p
                    className="text-sm text-charcoal font-medium"
                    animate={{ color: liHovered ? '#8a8580' : '#2c2c2c', x: liHovered ? 2 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    byte-craftsman-alpha
                  </motion.p>
                </div>
              </motion.a>

              {/* Resume */}
              <ContactRow>
                <IconBox icon="solar:document-text-linear" isHovered={resumeHovered} />
                <div className="flex-1">
                  <p className="text-[10px] text-taupe uppercase tracking-wider mb-0.5">Resume</p>
                  <p className="text-sm text-charcoal font-medium">View on GitHub</p>
                </div>
                <motion.a
                  href={personal.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onHoverStart={() => setResumeHovered(true)}
                  onHoverEnd={() => setResumeHovered(false)}
                  onMouseDown={() => setResumePressed(true)}
                  onMouseUp={() => setResumePressed(false)}
                  onMouseLeave={() => setResumePressed(false)}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    x: resumeHovered ? 2 : 0,
                    color: resumeHovered ? '#2c2c2c' : '#8a8580',
                    borderColor: resumeHovered ? '#8a8580' : '#e8e4df',
                  }}
                  transition={{ duration: 0.15 }}
                  className="px-3 py-1.5 text-[11px] font-medium border border-hairline rounded-lg min-h-[36px] flex-shrink-0 inline-flex items-center gap-1.5 outline-none"
                  aria-label="View resume"
                >
                  <motion.span animate={{ rotate: resumeHovered ? 15 : 0 }} transition={{ duration: 0.2 }}>
                    <Icon icon="solar:square-top-down-linear" width={14} />
                  </motion.span>
                  Open
                </motion.a>
              </ContactRow>
            </div>

            {/* Evidence separator */}
            <div className="mt-10 pt-8 border-t border-hairline">
              <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-3">Evidence Separation</p>
              <p className="text-xs text-taupe leading-relaxed">
                GitHub repositories provide verifiable evidence of technical work. Professional claims on this site — including project descriptions, architecture details, and outcomes — are self-reported and should be independently verified.
              </p>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
