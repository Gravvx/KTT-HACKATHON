// app/frontend/src/pages/ApplicationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI } from '../services/api';

function ApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async (phoneFilter = null) => {
    setLoading(true);
    try {
      const res = await servicesAPI.getApplications(phoneFilter);
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadApplications(searchPhone.trim() || null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <section className="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_#000000]">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#00d2ff] text-black text-[11px] font-mono font-bold px-2.5 py-0.5 uppercase tracking-wider">
            Local Civic Database Records
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-black tracking-tight leading-tight">
            MY WELFARE APPLICATIONS & TRACKING
          </h1>
          <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed">
            Track status updates for government pension requests, health insurance cards, and scholarship enrollments.
            Access direct links to the official government departmental portals.
          </p>
        </div>
      </section>

      {/* Search / Filter Bar */}
      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="Filter by Mobile Number..."
            className="border-2 border-black px-3 py-2 text-xs font-medium outline-none w-full sm:w-64"
          />
          <button
            type="submit"
            className="btn-neo bg-black text-[#a3ff00] border-2 border-black px-4 py-2 text-xs font-bold uppercase cursor-pointer"
          >
            Search
          </button>
          {searchPhone && (
            <button
              type="button"
              onClick={() => {
                setSearchPhone('');
                loadApplications(null);
              }}
              className="text-xs font-bold text-zinc-500 hover:text-black cursor-pointer px-1"
            >
              Clear
            </button>
          )}
        </form>

        <button
          onClick={() => navigate('/schemes')}
          className="btn-neo bg-[#a3ff00] text-black border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
        >
          + New Scheme Application
        </button>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="border-2 border-black p-10 bg-white text-center shadow-[4px_4px_0px_#000000]">
          <div className="inline-block w-8 h-8 border-4 border-black border-t-[#a3ff00] animate-spin mb-3"></div>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-black">
            Retrieving local application records...
          </p>
        </div>
      ) : applications.length === 0 ? (
        <div className="card-neo bg-white p-10 text-center space-y-3">
          <div className="text-3xl">📂</div>
          <h3 className="font-extrabold uppercase text-lg text-black">No Applications Found</h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto font-medium">
            You haven't submitted any scheme applications yet. Browse the welfare catalog to apply online in 30 seconds.
          </p>
          <button
            onClick={() => navigate('/schemes')}
            className="btn-neo bg-black text-[#a3ff00] px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer inline-block mt-2"
          >
            Explore Welfare Catalog ➔
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {applications.map((app) => {
            const portalUrl =
              app.officialPortalUrl ||
              (app.serviceId === 'healthcare'
                ? 'https://pmjay.gov.in/'
                : app.serviceId === 'social_security'
                ? 'https://nsap.nic.in/'
                : app.serviceId === 'education'
                ? 'https://scholarships.gov.in/'
                : 'https://nfsa.gov.in/');

            return (
              <div key={app.id} className="card-neo bg-white p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b-2 border-black mb-3">
                    <span className="font-mono text-xs font-black uppercase text-black bg-zinc-100 px-2 py-0.5 border border-black">
                      ID: {app.id}
                    </span>
                    <span
                      className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-black"
                      style={{ backgroundColor: app.statusColor || '#ffd600' }}
                    >
                      ● {app.status || 'Submitted'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold uppercase text-black mb-2">
                    {app.serviceName}
                  </h3>

                  <div className="space-y-1.5 text-xs font-mono text-zinc-700 mb-4">
                    <div>
                      <span className="text-zinc-400 uppercase">Applicant:</span>{' '}
                      <strong className="text-black">{app.applicantName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 uppercase">Contact:</span>{' '}
                      <span className="text-black">{app.phone}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 uppercase">District:</span>{' '}
                      <span className="text-black">{app.district || 'General'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 uppercase">Submitted:</span>{' '}
                      <span className="text-black">
                        {new Date(app.submittedAt).toLocaleDateString()} at{' '}
                        {new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Direct Official Government Portal Link */}
                  <div className="mb-2">
                    <a
                      href={portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-neo inline-flex items-center gap-1.5 bg-black text-[#a3ff00] hover:bg-zinc-900 border border-black text-xs font-extrabold uppercase px-3 py-1.5 no-underline w-full justify-center cursor-pointer"
                      title="Open official department portal in a new tab"
                    >
                      <span>🌐</span>
                      <span>Open Official Portal ➔</span>
                    </a>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t-2 border-black flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-zinc-500">
                    Storage: <strong className="text-black">localDb.json</strong>
                  </span>
                  <span className="text-xs font-bold uppercase text-black bg-[#a3ff00] px-2 py-0.5 border border-black">
                    Verified Local Record
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ApplicationsPage;
