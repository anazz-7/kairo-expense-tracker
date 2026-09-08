import React from 'react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isIos: boolean;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isIos,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-white w-full max-w-md rounded-3xl border border-border-subtle p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-[24px]">install_mobile</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-text-primary">Install Kairo AI App</h3>
              <p className="text-xs text-text-muted">Fast standalone app on your Home Screen</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        {isIos ? (
          <div className="space-y-4 text-left py-2">
            <p className="text-xs text-text-secondary leading-relaxed">
              Install <strong>Kairo AI</strong> on your iPhone or iPad for 1-tap launch, offline support, and full-screen experience:
            </p>

            <div className="bg-emerald-tint/80 border border-primary/30 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-3 text-xs font-semibold text-text-primary">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs shrink-0 font-mono">1</span>
                <span>Tap the <strong>Share</strong> icon in Safari bottom bar</span>
                <span className="material-symbols-outlined text-primary text-[20px]">ios_share</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-text-primary">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs shrink-0 font-mono">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
                <span className="material-symbols-outlined text-primary text-[20px]">add_box</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-text-primary">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs shrink-0 font-mono">3</span>
                <span>Tap <strong>Add</strong> in top right corner</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="bg-emerald-tint/80 border border-primary/30 p-4 rounded-2xl text-left space-y-2">
              <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>App Benefits</span>
              </h4>
              <ul className="text-xs text-text-secondary space-y-1.5 list-disc list-inside">
                <li>Instant 1-tap launch from your Home Screen</li>
                <li>100% offline transaction recording & balance engine</li>
                <li>Full-screen mobile app interface (no browser bars)</li>
                <li>Fast shake-to-add acceleration sensor trigger</li>
              </ul>
            </div>

            <button
              onClick={onInstall}
              className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span>Install Application</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
