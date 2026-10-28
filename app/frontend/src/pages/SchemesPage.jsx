// app/frontend/src/pages/SchemesPage.jsx
// Dedicated Government Welfare Schemes & Citizen Benefits Directory with Official Portal Links
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { servicesAPI } from '../services/api';

function SchemesPage() {
  const { currentLanguage, currentLanguageInfo } = useLanguage();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDoc, setExpandedDoc] = useState(null);

  // Application Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedServiceForApply, setSelectedServiceForApply] = useState(null);
  const [applyForm, setApplyForm] = useState({
    applicantName: '',
    phone: '',
    aadhaarLast4: '',
    district: '',
  });
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appSuccessResult, setAppSuccessResult] = useState(null);

  useEffect(() => {
    fetchServices(currentLanguage);
  }, [currentLanguage]);

  const fetchServices = async (lang) => {
    setLoading(true);
    setError(null);
    try {
      const res = await servicesAPI.getAllServices(lang);
      setServices(res.services || []);
    } catch (err) {
      console.error('Failed to load services:', err);
      setError('Could not connect to backend. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApplyModal = (svc) => {
    setSelectedServiceForApply(svc);
    setAppSuccessResult(null);
    setApplyForm({
      applicantName: '',
      phone: '',
      aadhaarLast4: '',
      district: '',
    });
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyForm.applicantName || !applyForm.phone) return;
    setSubmittingApp(true);
    try {
      const res = await servicesAPI.submitApplication({
        serviceId: selectedServiceForApply.id,
        serviceName: selectedServiceForApply.name,
        applicantName: applyForm.applicantName,
        phone: applyForm.phone,
        aadhaarLast4: applyForm.aadhaarLast4 || 'XXXX',
        district: applyForm.district || 'General',
        officialPortalUrl: selectedServiceForApply.officialPortalUrl || 'https://pgportal.gov.in/',
      });
      if (res.success) {
        setAppSuccessResult(res.application);
      }
    } catch (err) {
      console.error('Application submit error:', err);
      alert('Failed to submit application. Ensure the backend server is running.');
    } finally {
      setSubmittingApp(false);
    }
  };

  const categories = ['ALL', 'Healthcare', 'Pensions & Welfare', 'Education & Grants', 'Food & Civil Supplies'];

  const filteredServices = services.filter((svc) => {
    const matchesCategory = selectedCategory === 'ALL' || svc.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      (svc.name && svc.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (svc.description && svc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (svc.departments && svc.departments.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <section className="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_#000000]">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#a3ff00] text-black text-[11px] font-mono font-bold px-2.5 py-0.5 uppercase tracking-wider">
            Verified Indian Welfare Schemes
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-black tracking-tight leading-tight">
            PUBLIC WELFARE & SUBSIDY SCHEMES
          </h1>
          <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed">
            Apply online for Ayushman Bharat healthcare cards, Old Age & Disability Pensions, student grants, and ration cards.
            Each scheme provides direct links to the official government department website.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn-neo px-4 py-2 text-xs font-extrabold uppercase tracking-wider whitespace-nowrap border-2 border-black cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-black text-[#a3ff00] shadow-[3px_3px_0px_#a3ff00]'
                  : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_#000000]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <div className="flex items-center bg-white border-2 border-black shadow-[2px_2px_0px_#000000]">
            <span className="px-3 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name..."
              className="w-full py-2 pr-3 text-xs font-medium outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="border-2 border-black p-10 bg-white text-center shadow-[4px_4px_0px_#000000]">
          <div className="inline-block w-8 h-8 border-4 border-black border-t-[#a3ff00] animate-spin mb-3"></div>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-black">
            Loading Scheme Information...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((svc) => {
            const isDocOpen = expandedDoc === svc.id;
            const officialUrl =
              svc.officialPortalUrl ||
              (svc.id === 'healthcare'
                ? 'https://pmjay.gov.in/'
                : svc.id === 'social_security'
                ? 'https://nsap.nic.in/'
                : svc.id === 'education'
                ? 'https://scholarships.gov.in/'
                : 'https://nfsa.gov.in/');

            return (
              <div
                key={svc.id}
                className="card-neo bg-white flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 border border-black shadow-[1px_1px_0px_#000000]"
                      style={{ backgroundColor: svc.badgeColor || '#a3ff00' }}
                    >
                      {svc.category || 'General'}
                    </span>
                    {svc.helpline && (
                      <span className="bg-black text-[#a3ff00] font-mono text-[11px] font-bold px-2 py-0.5 border border-black">
                        📞 {svc.helpline}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-extrabold uppercase text-black mb-2 tracking-tight">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-zinc-700 font-medium leading-relaxed mb-4">
                    {svc.description}
                  </p>

                  {svc.eligibility && (
                    <div className="mb-4 p-3 bg-zinc-50 border-l-4 border-black text-xs font-medium text-zinc-800">
                      <strong className="uppercase font-bold text-black block mb-0.5">Eligibility:</strong>
                      {svc.eligibility}
                    </div>
                  )}

                  {/* Official Government Portal Button */}
                  <div className="mb-4">
                    <a
                      href={officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-neo inline-flex items-center gap-1.5 bg-black text-[#a3ff00] hover:bg-zinc-900 border border-black text-xs font-extrabold uppercase px-3 py-1.5 no-underline w-full justify-center cursor-pointer"
                      title="Open official department website in a new tab"
                    >
                      <span>🌐</span>
                      <span>Open Official Portal ({svc.id.toUpperCase()}) ➔</span>
                    </a>
                  </div>

                  {/* Expandable Document Checklist */}
                  {isDocOpen && svc.steps && svc.steps.length > 0 && (
                    <div className="mt-3 p-4 bg-yellow-50 border-2 border-black space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                        <span>📋</span> Required Documents Checklist:
                      </h4>
                      <ul className="text-xs font-medium text-zinc-800 space-y-1.5 pl-4 list-disc">
                        {svc.steps.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-zinc-50 border-t-2 border-black flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setExpandedDoc(isDocOpen ? null : svc.id)}
                    className="text-xs font-bold uppercase underline hover:text-[#ff007a] cursor-pointer"
                  >
                    {isDocOpen ? 'Hide Checklist ▲' : 'View Documents ▼'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        navigate('/chat', {
                          state: { initialQuery: `Explain eligibility and documents required for ${svc.name}.` },
                        })
                      }
                      className="btn-neo bg-white hover:bg-zinc-100 text-black border-2 border-black px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Ask AI 💬
                    </button>
                    <button
                      onClick={() => handleOpenApplyModal(svc)}
                      className="btn-neo bg-[#a3ff00] hover:bg-[#8ee000] text-black border-2 border-black px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Apply Online ➔
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Online Application Modal */}
      {applyModalOpen && selectedServiceForApply && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black max-w-lg w-full p-6 sm:p-8 shadow-[8px_8px_0px_#000000] relative">
            <button
              onClick={() => setApplyModalOpen(false)}
              className="absolute top-4 right-4 text-black hover:bg-zinc-200 w-8 h-8 font-bold border-2 border-black flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {appSuccessResult ? (
              <div className="space-y-4">
                <div className="bg-[#a3ff00] border-2 border-black p-4 text-black">
                  <div className="text-2xl mb-1">🎉</div>
                  <h3 className="font-extrabold uppercase text-base">Application Submitted Successfully!</h3>
                  <p className="text-xs font-medium mt-1">
                    Your request has been stored in local records and forwarded for verification.
                  </p>
                </div>

                <div className="bg-zinc-50 border-2 border-black p-4 space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 uppercase">Tracking ID:</span>
                    <strong className="text-black text-sm block">{appSuccessResult.id}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase">Scheme:</span>
                    <span className="text-black font-bold block">{appSuccessResult.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase">Applicant:</span>
                    <span className="text-black block">{appSuccessResult.applicantName} ({appSuccessResult.phone})</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase">Status:</span>
                    <span className="bg-black text-[#a3ff00] px-2 py-0.5 font-bold uppercase inline-block mt-0.5">
                      {appSuccessResult.status}
                    </span>
                  </div>
                  <div className="pt-2">
                    <a
                      href={selectedServiceForApply.officialPortalUrl || 'https://pgportal.gov.in/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-neo inline-flex items-center gap-1.5 bg-black text-[#a3ff00] px-3 py-1.5 text-xs font-bold uppercase no-underline border border-black"
                    >
                      🌐 Open Official Department Portal ➔
                    </a>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => {
                      setApplyModalOpen(false);
                      navigate('/applications');
                    }}
                    className="btn-neo bg-black text-[#a3ff00] px-4 py-2 text-xs font-bold uppercase cursor-pointer"
                  >
                    View in Applications Tab ➔
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <span className="bg-[#ff007a] text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase">
                    Official Application Form
                  </span>
                  <h3 className="text-xl font-black uppercase text-black mt-1">
                    Apply for {selectedServiceForApply.name}
                  </h3>
                  <p className="text-xs text-zinc-600 font-medium">
                    Submit your basic citizen details below. All records are saved securely in local storage.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-black mb-1">
                      Full Applicant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={applyForm.applicantName}
                      onChange={(e) => setApplyForm({ ...applyForm, applicantName: e.target.value })}
                      placeholder="e.g. Ramesh Kumar Sharma"
                      className="w-full border-2 border-black p-2.5 text-xs font-medium outline-none focus:bg-zinc-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-black mb-1">
                      Mobile Number (WhatsApp/SMS) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={applyForm.phone}
                      onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full border-2 border-black p-2.5 text-xs font-medium outline-none focus:bg-zinc-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-1">
                        Aadhaar (Last 4 Digits)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={applyForm.aadhaarLast4}
                        onChange={(e) => setApplyForm({ ...applyForm, aadhaarLast4: e.target.value })}
                        placeholder="e.g. 5489"
                        className="w-full border-2 border-black p-2.5 text-xs font-medium outline-none focus:bg-zinc-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-1">
                        District / City
                      </label>
                      <input
                        type="text"
                        value={applyForm.district}
                        onChange={(e) => setApplyForm({ ...applyForm, district: e.target.value })}
                        placeholder="e.g. Pune / Mumbai"
                        className="w-full border-2 border-black p-2.5 text-xs font-medium outline-none focus:bg-zinc-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold uppercase text-zinc-600 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="btn-neo bg-black text-[#a3ff00] hover:bg-zinc-900 border-2 border-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {submittingApp ? 'Submitting...' : 'Submit Application ➔'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SchemesPage;
