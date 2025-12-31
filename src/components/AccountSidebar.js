import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AccountSidebar({ person, open, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);


  // For animation: always render, but visually hide when not open

  const getBadge = (text, color = 'bg-gray-100 text-gray-800') => (
    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${color}`}>{text}</span>
  );

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return String(d);
    }
  };

  return (
    <>
      {/* backdrop overlay */}
      {/* Backdrop overlay, fade in/out */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Sidebar panel, slide in/out from right */}
      <aside
        className={`fixed top-0 right-0 h-full z-50 w-full sm:w-3/5 md:w-2/5 lg:w-2/5 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        style={{ willChange: 'transform' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{person ? `${person.firstName} ${person.lastName}` : 'Person'}</h3>
            <div className="mt-1 text-sm text-gray-500">Account details</div>
          </div>
          <div className="flex items-center gap-3">
            {person && person.registered ? getBadge('Checked In', 'bg-green-700 text-white') : getBadge('Pending', 'bg-yellow-500 text-white')}
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100 focus:outline-none"
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-auto h-full">
          <div className="flex flex-col gap-6">
            <div className="flex gap-6 items-start">
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">First name</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.firstName || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Last name</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.lastName || '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Age</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.age ?? '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Age bracket</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.ageBracket || '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.location || '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Timestamp</div>
                    <div className="text-sm text-gray-900 font-medium">{formatDate(person?.registeredAt || person?.createdAt || person?.timestamp)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Shirt size</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.shirtSize || '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment status</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.paymentStatus || '—'}</div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Distribution status</div>
                    <div className="text-sm text-gray-900 font-medium">{person?.distributionStatus || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="w-40 flex-shrink-0">
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg h-40 w-40 flex items-center justify-center">
                  <div className="text-center px-2">
                    <div className="text-xs text-gray-500">Shirt image</div>
                    <div className="text-xs text-gray-400 mt-2">Placeholder — upload later</div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500">Shirt preview (will display uploaded image)</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900">Notes & Actions</h4>
              <p className="mt-2 text-sm text-gray-600">You can add internal notes or actions here later — e.g., payment follow-ups, distribution notes, or manual updates.</p>

              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-[#001740] text-white text-sm rounded hover:bg-[#0b1f48]">Edit</button>
                <button className="px-4 py-2 border border-gray-200 text-sm rounded hover:bg-gray-50">Message</button>
                <button className="px-4 py-2 border border-red-200 text-sm rounded hover:bg-red-50 text-red-600">Remove</button>
              </div>
            </div>

          </div>
        </div>
      </aside>
    </>
  );
}
