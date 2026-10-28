// app/frontend/src/pages/Home.jsx
// Core Civic Grievance Resolving & Community Tracking Hub with Leaflet Geo-tagging Map
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { civicAPI } from '../services/api';
import CivicMap from '../components/CivicMap';

const Home = () => {
  const { currentLanguage, currentLanguageInfo } = useLanguage();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [showMapSection, setShowMapSection] = useState(true);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    category: 'Roads & Potholes',
    description: '',
    location: '',
    city: 'New Delhi',
    lat: null,
    lng: null,
    urgency: 'High',
    reportedBy: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(null);

  useEffect(() => {
    loadIssues(selectedCategory);
  }, [selectedCategory]);

  const loadIssues = async (cat = 'ALL') => {
    setLoading(true);
    try {
      const res = await civicAPI.getAllIssues(cat);
      setIssues(res.issues || []);
    } catch (err) {
      console.error('Error fetching civic issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await civicAPI.upvoteIssue(id);
      if (res.success) {
        setIssues((prev) =>
          prev.map((item) => (item.id === id ? { ...item, upvotes: res.upvotes } : item))
        );
      }
    } catch (err) {
      console.error('Error upvoting issue:', err);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.title || !reportForm.description || !reportForm.location) return;

    setSubmitting(true);
    try {
      const res = await civicAPI.reportIssue(reportForm);
      if (res.success) {
        setReportSuccess(res.issue);
        loadIssues(selectedCategory);
      }
    } catch (err) {
      console.error('Report error:', err);
      alert('Failed to register civic complaint. Ensure backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    'ALL',
    'Roads & Potholes',
    'Sanitation & Waste',
    'Water & Sewage',
    'Electricity & Streetlights',
  ];

  const filteredIssues = issues.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.city && item.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-10 pb-12">
      {/* High-Contrast Hero Banner */}
      <section className="bg-white border-2 border-black p-6 sm:p-10 shadow-[6px_6px_0px_#000000]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-black text-[#a3ff00] text-xs font-mono font-bold px-3 py-1 uppercase tracking-widest border border-black">
            <span>●</span> Civic Issue Resolving Engine
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-[1.05]">
            RESOLVE CIVIC ISSUES.{' '}
            <span className="bg-[#a3ff00] text-black px-2 sm:px-3 py-0.5 inline-block">
              IN MINUTES.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-700 font-medium leading-relaxed max-w-2xl">
            Report road potholes, uncollected garbage, contaminated water pipelines, and dark streetlights.
            Geo-tag issue coordinates on our interactive map and get instant AI department escalation roadmaps.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => {
                setReportSuccess(null);
                setReportModalOpen(true);
              }}
              className="btn-neo bg-[#ff007a] text-white hover:bg-[#e0006b] border-2 border-black px-5 py-3 text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              <span>📢</span> Report A Civic Problem (Map Geo-tag)
            </button>

            <button
              onClick={() => navigate('/chat')}
              className="btn-neo bg-[#a3ff00] text-black hover:bg-[#8ee000] border-2 border-black px-5 py-3 text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              <span>🤖</span> Talk to AI Assistant (Voice Mic)
            </button>

            <button
              onClick={() => navigate('/schemes')}
              className="btn-neo bg-white text-black hover:bg-zinc-100 border-2 border-black px-5 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              <span>🏛️</span> Welfare Schemes Directory
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Civic Geo-Map Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-extrabold uppercase text-black m-0 flex items-center gap-2">
              <span>🗺️</span> Interactive Civic Grievance Geo-Map
            </h3>
            <p className="text-xs text-zinc-600 font-medium mt-0.5">
              Live map showing citizen complaints pinned with GPS coordinates. Click pins to view official portal links.
            </p>
          </div>
          <button
            onClick={() => setShowMapSection(!showMapSection)}
            className="text-xs font-bold uppercase underline text-black cursor-pointer"
          >
            {showMapSection ? 'Hide Map ▲' : 'Show Map ▼'}
          </button>
        </div>

        {showMapSection && (
          <CivicMap issues={filteredIssues} />
        )}
      </section>

      {/* Community Civic Issues Tracker */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-[#ff007a] border border-black"></span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black m-0">
                Community Civic Complaints Feed
              </h2>
            </div>
            <p className="text-xs text-zinc-600 font-medium">
              Verified local grievances logged by citizens. Upvote issues to expedite municipal repair.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80">
            <div className="flex items-center bg-white border-2 border-black shadow-[2px_2px_0px_#000000]">
              <span className="px-3 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area, complaint, ward..."
                className="w-full py-2 pr-3 text-xs font-medium outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-xs font-bold hover:text-red-500 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn-neo px-4 py-2 text-xs font-extrabold uppercase tracking-wider whitespace-nowrap border-2 border-black cursor-pointer ${
                  isSelected
                    ? 'bg-black text-[#a3ff00] shadow-[3px_3px_0px_#a3ff00]'
                    : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_#000000]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="border-2 border-black p-10 bg-white text-center shadow-[4px_4px_0px_#000000]">
            <div className="inline-block w-8 h-8 border-4 border-black border-t-[#a3ff00] animate-spin mb-3"></div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              Retrieving Local Civic Records...
            </p>
          </div>
        )}

        {/* Issues Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => {
              const isPlanOpen = expandedPlan === issue.id;
              const officialPortalUrl = issue.officialPortalUrl || 'https://pgportal.gov.in/';

              return (
                <div
                  key={issue.id}
                  className="card-neo bg-white flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5">
                    {/* Top status bar */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono font-bold uppercase bg-zinc-100 text-black px-2 py-0.5 border border-black">
                        {issue.id}
                      </span>
                      <span
                        className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-black"
                        style={{ backgroundColor: issue.statusColor || '#00d2ff' }}
                      >
                        ● {issue.status}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold uppercase text-black mb-2 leading-tight">
                      {issue.title}
                    </h3>

                    <p className="text-xs text-zinc-700 font-medium leading-relaxed mb-3">
                      {issue.description}
                    </p>

                    <div className="space-y-1.5 text-xs font-mono text-zinc-600 mb-4 bg-zinc-50 p-3 border-l-4 border-black">
                      <div>
                        <strong className="text-black uppercase">📍 Location:</strong> {issue.location} ({issue.city})
                      </div>
                      <div>
                        <strong className="text-black uppercase">🏛️ Dept:</strong> {issue.responsibleDepartment}
                      </div>
                      <div>
                        <strong className="text-black uppercase">📞 Helpline:</strong> {issue.helpline}
                      </div>
                    </div>

                    {/* Official Portal Link */}
                    <div className="mb-3">
                      <a
                        href={officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-neo inline-flex items-center gap-1.5 bg-black text-[#a3ff00] hover:bg-zinc-900 border border-black text-[11px] font-extrabold uppercase px-3 py-1.5 no-underline w-full justify-center cursor-pointer"
                        title="Open official government department website"
                      >
                        <span>🌐</span>
                        <span>Open Official Portal ➔</span>
                      </a>
                    </div>

                    {/* Expandable Resolution Roadmap */}
                    {isPlanOpen && issue.resolutionSteps && (
                      <div className="mt-3 p-3 bg-yellow-50 border-2 border-black space-y-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                          <span>📋</span> Official Escalation Steps:
                        </h4>
                        <ul className="text-xs font-medium text-zinc-800 space-y-1 pl-4 list-disc">
                          {issue.resolutionSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-3.5 bg-zinc-50 border-t-2 border-black flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => handleUpvote(issue.id, e)}
                      className="btn-neo bg-white hover:bg-zinc-100 text-black border-2 border-black px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                      title="Upvote this complaint to increase priority"
                    >
                      <span>▲</span>
                      <span>{issue.upvotes || 1} Upvotes</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedPlan(isPlanOpen ? null : issue.id)}
                        className="text-xs font-bold uppercase underline hover:text-[#ff007a] cursor-pointer"
                      >
                        {isPlanOpen ? 'Hide Steps' : 'View Steps'}
                      </button>

                      <button
                        onClick={() =>
                          navigate('/chat', {
                            state: { initialQuery: `How do I escalate this civic issue: ${issue.title} located at ${issue.location}? Give me a complaint letter.` },
                          })
                        }
                        className="btn-neo bg-[#a3ff00] hover:bg-[#8ee000] text-black border-2 border-black px-3 py-1.5 text-xs font-bold uppercase cursor-pointer"
                      >
                        Ask AI ➔
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Report Civic Problem Modal with Geo-tagging Map Picker */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black max-w-xl w-full p-5 sm:p-7 shadow-[8px_8px_0px_#000000] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-4 right-4 text-black hover:bg-zinc-200 w-8 h-8 font-bold border-2 border-black flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {reportSuccess ? (
              <div className="space-y-4">
                <div className="bg-[#a3ff00] border-2 border-black p-4 text-black">
                  <div className="text-2xl mb-1">📢</div>
                  <h3 className="font-extrabold uppercase text-base">Civic Complaint Registered!</h3>
                  <p className="text-xs font-medium mt-1">
                    Your grievance has been stored in local records and assigned to the municipal department.
                  </p>
                </div>

                <div className="bg-zinc-50 border-2 border-black p-4 space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 uppercase">Docket ID:</span>
                    <strong className="text-black text-sm block">{reportSuccess.id}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase">Issue:</span>
                    <span className="text-black font-bold block">{reportSuccess.title}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase">Assigned Authority:</span>
                    <span className="text-black block">{reportSuccess.responsibleDepartment}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase">Helpline:</span>
                    <span className="bg-black text-[#a3ff00] px-2 py-0.5 font-bold uppercase inline-block mt-0.5">
                      📞 {reportSuccess.helpline}
                    </span>
                  </div>
                  {reportSuccess.officialPortalUrl && (
                    <div className="pt-2">
                      <a
                        href={reportSuccess.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-neo inline-flex items-center gap-1.5 bg-black text-[#a3ff00] px-3 py-1.5 text-xs font-bold uppercase no-underline border border-black"
                      >
                        🌐 Open Official Portal ➔
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => {
                      setReportModalOpen(false);
                      navigate('/chat', {
                        state: {
                          initialQuery: `What are the legal steps to follow up on my civic grievance ID ${reportSuccess.id} regarding ${reportSuccess.title}? Write a complaint letter.`,
                        },
                      });
                    }}
                    className="btn-neo bg-black text-[#a3ff00] px-4 py-2 text-xs font-bold uppercase cursor-pointer"
                  >
                    Ask AI For Escalation Plan ➔
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <span className="bg-[#ff007a] text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase">
                    Public Grievance Redressal
                  </span>
                  <h3 className="text-xl font-black uppercase text-black mt-1">
                    Report a Civic Issue
                  </h3>
                  <p className="text-xs text-zinc-600 font-medium">
                    Submit public infrastructure defects with GPS geo-tagging for municipal department assignment.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-black mb-1">
                      Category *
                    </label>
                    <select
                      value={reportForm.category}
                      onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                      className="w-full border-2 border-black p-2.5 text-xs font-bold outline-none bg-zinc-50 uppercase cursor-pointer"
                    >
                      <option value="Roads & Potholes">Roads & Potholes (खड्डे / सड़क)</option>
                      <option value="Sanitation & Waste">Sanitation & Garbage Dumps (कचरा / नाली)</option>
                      <option value="Water & Sewage">Water Pipeline Leak / Sewage (जल आपूर्ति / सीवर)</option>
                      <option value="Electricity & Streetlights">Electricity Outage & Broken Streetlights (बिजली / स्ट्रीट लाइट)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-black mb-1">
                      Issue Title / Summary *
                    </label>
                    <input
                      type="text"
                      required
                      value={reportForm.title}
                      onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                      placeholder="e.g. Dangerous 2-foot pothole near Metro Station Gate 2"
                      className="w-full border-2 border-black p-2.5 text-xs font-medium outline-none focus:bg-zinc-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-black mb-1">
                      Detailed Description *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                      placeholder="Describe the severity, duration, and safety hazard..."
                      className="w-full border-2 border-black p-2.5 text-xs font-medium outline-none focus:bg-zinc-50 resize-none"
                    />
                  </div>

                  {/* Interactive Geo-tagging Map Picker */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-black mb-1 flex items-center justify-between">
                      <span>Geo-tag Location on Map (Click Pin or Use GPS)</span>
                      {reportForm.lat && (
                        <span className="font-mono text-[#ff007a] lowercase">
                          [{reportForm.lat}, {reportForm.lng}]
                        </span>
                      )}
                    </label>

                    <CivicMap
                      isPickerMode={true}
                      onLocationSelect={({ lat, lng, address }) => {
                        setReportForm((prev) => ({
                          ...prev,
                          lat,
                          lng,
                          location: address,
                        }));
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-1">
                        Location / Landmark Text *
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.location}
                        onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                        placeholder="Click map above or type address..."
                        className="w-full border-2 border-black p-2 text-xs font-medium outline-none focus:bg-zinc-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-1">
                        City / District
                      </label>
                      <input
                        type="text"
                        value={reportForm.city}
                        onChange={(e) => setReportForm({ ...reportForm, city: e.target.value })}
                        placeholder="e.g. Delhi / Pune / Mumbai"
                        className="w-full border-2 border-black p-2 text-xs font-medium outline-none focus:bg-zinc-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-1">
                        Urgency Level
                      </label>
                      <select
                        value={reportForm.urgency}
                        onChange={(e) => setReportForm({ ...reportForm, urgency: e.target.value })}
                        className="w-full border-2 border-black p-2 text-xs font-bold outline-none bg-zinc-50 uppercase cursor-pointer"
                      >
                        <option value="Critical">Critical (Immediate Hazard)</option>
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={reportForm.phone}
                        onChange={(e) => setReportForm({ ...reportForm, phone: e.target.value })}
                        placeholder="For SMS verification"
                        className="w-full border-2 border-black p-2 text-xs font-medium outline-none focus:bg-zinc-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold uppercase text-zinc-600 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-neo bg-[#ff007a] hover:bg-[#e0006b] text-white border-2 border-black font-extrabold px-5 py-2.5 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Registering...' : 'Register Complaint ➔'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
