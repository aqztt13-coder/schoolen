import { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'default' | 'subtle';
}

export function PWAInstallButton({ variant = 'default' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={
          variant === 'subtle'
            ? 'inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 whitespace-nowrap'
            : 'inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 whitespace-nowrap'
        }
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        <span>تثبيت التطبيق على الجهاز</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
        >
          <Share className="h-4 w-4 text-emerald-800" aria-hidden="true" />
          <span>تثبيت التطبيق على iPhone / iPad</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          >
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 id="ios-install-title" className="font-display text-lg font-bold text-slate-900">
                  تثبيت منصة رواد العالم
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="إغلاق نافذة التثبيت"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-600">
                <li>1. اضغط على زر المشاركة (Share) في شريط متصفح Safari.</li>
                <li>2. مرر للأسفل واختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).</li>
                <li>3. اضغط «إضافة» لتشغيل المنصة كتطبيق مستقل.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-800 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                حسناً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
