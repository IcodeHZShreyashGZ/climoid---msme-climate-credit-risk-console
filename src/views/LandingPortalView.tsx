import React, { useState } from 'react';
import { TabType } from '../types';

interface LandingPortalViewProps {
  onEnterConsole: (initialTab?: TabType) => void;
}

export function LandingPortalView({ onEnterConsole }: LandingPortalViewProps) {
  const [email, setEmail] = useState('underwriter@hdfcbank.com');
  const [mfaCode, setMfaCode] = useState('489201');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        onEnterConsole('dashboard');
      }, 600);
    }, 800);
  };

  const handleSSO = (provider: string) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        onEnterConsole('dashboard');
      }, 500);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans selection:bg-[#dae2fd]">
      {/* Top Institutional Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#bcc9c6]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#00685f] text-white flex items-center justify-center font-bold text-sm">
              C
            </div>
            <div>
              <span className="font-bold text-[17px] text-[#0b1c30] tracking-tight block leading-none">Climoid</span>
              <span className="text-[12px] text-[#565e74] hidden sm:block mt-0.5">MSME Physical Climate Credit Engine</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] text-[#565e74]">
            <a href="#underwriting-preview" className="hover:text-[#0b1c30] transition-colors">Appraisal Sample</a>
            <a href="#technical-methodology" className="hover:text-[#0b1c30] transition-colors">Actuarial Methodology</a>
            <a href="#regulatory-framework" className="hover:text-[#0b1c30] transition-colors">RBI Master Directions</a>
            <a href="#portal-auth" className="hover:text-[#0b1c30] transition-colors">Institutional Login</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onEnterConsole('dashboard')}
              className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-md border border-[#bcc9c6]/50 bg-white text-[#0b1c30] hover:bg-[#f2f4f6] text-[13px] font-medium transition-colors"
            >
              Demo Workspace
            </button>
            <button
              type="button"
              onClick={() => onEnterConsole('dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#00685f] text-white text-[13px] font-medium hover:bg-[#005049] transition-colors"
            >
              <span>Access Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Narrative & Underwriting Demonstration */}
      <main className="flex-1">
        <section className="pt-10 pb-14 border-b border-[#bcc9c6]/30 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Direct Institutional Narrative */}
              <div className="lg:col-span-7">
                <div className="text-[12px] text-[#565e74] font-medium mb-3">
                  Scheduled Commercial Banks & NBFC Credit Committees · RBI Directive 2024
                </div>

                <h1 className="text-[34px] sm:text-[40px] font-semibold text-[#0b1c30] mb-4 leading-tight tracking-tight">
                  Pricing localized physical climate hazard into Indian MSME credit underwriting.
                </h1>

                <p className="text-[15px] text-[#565e74] max-w-2xl mb-6 leading-relaxed">
                  Traditional credit bureaus evaluate historical audited accounts. Climoid augments the sanction note with high-resolution 10-meter hydrological models, pluvial flood plain buffers, and wet-bulb refrigeration stress curves to compute the exact basis-point credit drag before loan disbursement.
                </p>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <button
                    type="button"
                    onClick={() => onEnterConsole('borrowers')}
                    className="px-4 py-2 rounded-md bg-[#00685f] hover:bg-[#005049] text-white text-[13px] font-medium transition-colors"
                  >
                    Open Underwriter File: Maa Gayatri Agro
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterConsole('map')}
                    className="px-4 py-2 rounded-md border border-[#bcc9c6]/50 bg-white hover:bg-[#f2f4f6] text-[#0b1c30] text-[13px] font-medium transition-colors"
                  >
                    Launch Baramati Micro-Basin GIS Map
                  </button>
                </div>

                {/* Concrete Operational Portfolio Numbers */}
                <div className="grid grid-cols-3 gap-6 pt-5 border-t border-[#bcc9c6]/30">
                  <div>
                    <div className="text-[12px] text-[#565e74]">Underwritten Book</div>
                    <div className="text-[24px] font-semibold text-[#0b1c30] font-mono mt-0.5">₹4,280 Cr</div>
                    <div className="text-[11px] text-[#565e74]">18 Scheduled Banks & NBFCs</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[#565e74]">Hydrology Resolution</div>
                    <div className="text-[24px] font-semibold text-[#0b1c30] font-mono mt-0.5">10m</div>
                    <div className="text-[11px] text-[#565e74]">Sentinel-2 Surface Elevation</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[#565e74]">Median Climate Drag</div>
                    <div className="text-[24px] font-semibold text-[#ba1a1a] font-mono mt-0.5">-86 bps</div>
                    <div className="text-[11px] text-[#565e74]">Loan Margin Adjustment</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Actual Credit Appraisal File Preview */}
              <div className="lg:col-span-5" id="underwriting-preview">
                <div className="bg-[#f8f9ff] border border-[#bcc9c6]/50 rounded-lg p-5 text-[13px]">
                  <div className="flex items-start justify-between pb-3 border-b border-[#bcc9c6]/30">
                    <div>
                      <div className="font-semibold text-[#0b1c30] text-[15px]">Surat Textile Cluster Park</div>
                      <div className="text-[12px] text-[#565e74]">Working Capital Loan · ₹3.50 Cr · Tenor 36 Mo</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#565e74]">Catchment</div>
                      <div className="font-mono text-[12px] text-[#0b1c30]">Tapi River Estuary</div>
                    </div>
                  </div>

                  {/* Bureau vs Climate Scorecard */}
                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="p-3 bg-white border border-[#bcc9c6]/30 rounded-md">
                      <div className="text-[11px] text-[#565e74]">Traditional Bureau Score</div>
                      <div className="text-[28px] font-semibold text-[#0b1c30] font-mono mt-0.5">768</div>
                      <div className="text-[11px] text-emerald-800 font-medium mt-1">Tier-1 Base Grade (A-)</div>
                      <div className="text-[11px] text-[#565e74] mt-0.5">Base PD: 1.85%</div>
                    </div>

                    <div className="p-3 bg-white border border-rose-200 rounded-md">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#00685f] font-medium">Climate-Adjusted</span>
                        <span className="font-mono text-rose-700 font-semibold">-86 pts</span>
                      </div>
                      <div className="text-[28px] font-semibold text-rose-700 font-mono mt-0.5">682</div>
                      <div className="text-[11px] text-rose-700 font-medium mt-1">Grade B (Monsoon Inundation)</div>
                      <div className="text-[11px] text-[#565e74] mt-0.5">Adjusted PD: 3.42%</div>
                    </div>
                  </div>

                  {/* Hydrographic Hazard Coordinates */}
                  <div className="bg-white border border-[#bcc9c6]/30 rounded-md p-3 mb-3 space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-[#565e74]">
                      <span>Geo-Centroid: 21°08'N, 72°49'E</span>
                      <span>Elevation: 13.0m MSL</span>
                    </div>

                    <div className="border border-[#bcc9c6]/30 rounded bg-[#f2f4f6] p-2.5 text-[12px] space-y-1">
                      <div className="flex justify-between text-[#0b1c30]">
                        <span className="font-medium">100-Yr Return Period Surge:</span>
                        <span className="font-mono text-rose-700 font-semibold">1.8m inundation depth</span>
                      </div>
                      <div className="flex justify-between text-[#565e74]">
                        <span>Supply Corridor Inaccessibility:</span>
                        <span className="font-mono text-[#0b1c30]">14.2 Days during monsoon peak</span>
                      </div>
                      <div className="flex justify-between text-[#565e74]">
                        <span>Structural Defense Bund:</span>
                        <span className="text-[#ba1a1a] font-medium">Unprotected (Plinth 0.3m)</span>
                      </div>
                    </div>
                  </div>

                  {/* Underwriter Covenant Recommendation */}
                  <div className="pt-2 border-t border-[#bcc9c6]/30 text-[12px]">
                    <div className="text-[#565e74] text-[11px] mb-1">Sanction Covenant Recommendation:</div>
                    <div className="p-2.5 bg-white border border-[#00685f]/30 rounded text-[#0b1c30] space-y-1">
                      <div>
                        <strong>1. Pricing:</strong> +115 bps spread adjustment (10.90% p.a. vs 9.75% base rate)
                      </div>
                      <div>
                        <strong>2. Security:</strong> Mandatory parametric flood insurance endorsement policy before 1st tranche drawdown.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Methodology & Operational Flow (Real Institutional Schema) */}
        <section className="py-14 bg-[#f8f9ff] border-b border-[#bcc9c6]/30" id="technical-methodology">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-8">
              <h2 className="text-[22px] font-semibold text-[#0b1c30] tracking-tight">
                Actuarial Physical Hazard Integration Architecture
              </h2>
              <p className="text-[14px] text-[#565e74] mt-1 leading-relaxed">
                How satellite telemetry, micro-basin hydrology, and credit default equations translate into defensible capital adequacy adjustments.
              </p>
            </div>

            {/* Asymmetrical Technical Specification Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Data Feeds & Spatial Resolution */}
              <div className="lg:col-span-5 bg-white border border-[#bcc9c6]/30 rounded-lg p-5 text-[13px]">
                <h3 className="font-semibold text-[14px] text-[#0b1c30] mb-3">
                  Spatial Telemetry Ingestion Layer
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-[#f8f9ff] border border-[#bcc9c6]/20 rounded">
                    <div className="font-semibold text-[#0b1c30]">1. Optical Surface Elevation (10m)</div>
                    <p className="text-[12px] text-[#565e74] mt-0.5">
                      Sentinel-2 multispectral passes and Survey of India digital elevation models calibrated to identify borrower facility plinth offsets down to 30 centimeters.
                    </p>
                  </div>

                  <div className="p-3 bg-[#f8f9ff] border border-[#bcc9c6]/20 rounded">
                    <div className="font-semibold text-[#0b1c30]">2. Hydrological Runoff & Catchments</div>
                    <p className="text-[12px] text-[#565e74] mt-0.5">
                      ECMWF ERA5+ reanalysis paired with India Meteorological Department (IMD) river gauge telemetry for 48-hour surge nowcasting across 480 sub-basins.
                    </p>
                  </div>

                  <div className="p-3 bg-[#f8f9ff] border border-[#bcc9c6]/20 rounded">
                    <div className="font-semibold text-[#0b1c30]">3. Thermal & Power Outage Hazard</div>
                    <p className="text-[12px] text-[#565e74] mt-0.5">
                      Wet-bulb ambient temperature thresholds (&gt;35°C) modeling agricultural spoilage and 33kV industrial feeder transformer trip frequencies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Actuarial Equations & Sanction Interventions */}
              <div className="lg:col-span-7 bg-white border border-[#bcc9c6]/30 rounded-lg p-5 text-[13px]">
                <h3 className="font-semibold text-[14px] text-[#0b1c30] mb-3">
                  Credit Drag Computation & Risk Mitigation
                </h3>
                <div className="space-y-3">
                  <div className="border border-[#bcc9c6]/30 rounded p-3 bg-[#f8f9ff]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#0b1c30]">Physical Damage Haircut (PD Delta)</span>
                      <span className="font-mono text-[11px] text-[#565e74]">Formula Ref: CLM-ACT-04</span>
                    </div>
                    <p className="text-[12px] text-[#565e74]">
                      Expected Loss (EL) is recalculated dynamically:
                    </p>
                    <div className="font-mono text-[11px] bg-white p-2 rounded border border-[#bcc9c6]/30 text-[#0b1c30] my-1.5">
                      EL_adjusted = PD_base · (1 + Σ Peril_hazard · Vulnerability_sector) · LTV_adjusted · EAD
                    </div>
                    <p className="text-[11px] text-[#565e74]">
                      Borrowers within 500m of unbunded river corridors experience an empirical +160 to +240 bps spread haircut unless offset by on-site diesel generator runtime or elevated plinths.
                    </p>
                  </div>

                  <div className="border border-[#bcc9c6]/30 rounded p-3 bg-[#f8f9ff]">
                    <div className="font-semibold text-[#0b1c30] mb-1">Automated Sanction Disbursal Interventions</div>
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      <div className="p-2 bg-white rounded border border-[#bcc9c6]/20">
                        <span className="font-medium text-[#0b1c30] block">Margin Repricing</span>
                        <span className="text-[11px] text-[#565e74]">Automatic risk premium additions (+25 to +180 bps) added to the base rate.</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-[#bcc9c6]/20">
                        <span className="font-medium text-[#0b1c30] block">Parametric Attachment</span>
                        <span className="text-[11px] text-[#565e74]">Enforces insurance rider with rainfall deficit triggers prior to disbursement.</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-[#bcc9c6]/20">
                        <span className="font-medium text-[#0b1c30] block">Transit Covenants</span>
                        <span className="text-[11px] text-[#565e74]">Mandates verified backup dry-access road agreements for single-route sites.</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-[#bcc9c6]/20">
                        <span className="font-medium text-[#0b1c30] block">Moratorium Alarms</span>
                        <span className="text-[11px] text-[#565e74]">Automatic 60-day debt service alerts dispatched to branch RMs on storm alerts.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Institutional Sign-In Authentication Section */}
        <section className="py-14 bg-white border-b border-[#bcc9c6]/30" id="portal-auth">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6">
                <div className="text-[12px] font-medium text-[#565e74] mb-2">
                  Institutional Access Enclave
                </div>

                <h2 className="text-[26px] font-semibold text-[#0b1c30] mb-3">
                  Underwriter Identity Federation & Portal
                </h2>

                <p className="text-[14px] text-[#565e74] mb-6 leading-relaxed">
                  Access live loan origination APIs, credit sanction packs, portfolio stress simulations, and NGFS forward scenario projections through your chartered bank credentials.
                </p>

                <div className="space-y-3 text-[13px] text-[#0b1c30]">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#00685f] text-[18px] shrink-0 mt-0.5">check</span>
                    <span>SOC2 Type II and ISO 27001 audited institutional infrastructure</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#00685f] text-[18px] shrink-0 mt-0.5">check</span>
                    <span>FIPS 140-2 Level 3 Hardware Security Module key protection</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#00685f] text-[18px] shrink-0 mt-0.5">check</span>
                    <span>RBI Master Direction (Climate Risk Disclosures 2024) compliant reporting</span>
                  </div>
                </div>
              </div>

              {/* Login Card */}
              <div className="lg:col-span-6 max-w-md mx-auto w-full">
                <div className="bg-[#f8f9ff] border border-[#bcc9c6]/40 rounded-lg p-6">
                  <div className="pb-3 mb-4 border-b border-[#bcc9c6]/30">
                    <h3 className="font-semibold text-[16px] text-[#0b1c30]">Underwriter Sign-In</h3>
                    <p className="text-[12px] text-[#565e74]">Chartered Commercial Bank & NBFC Portal</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <button
                      type="button"
                      onClick={() => handleSSO('Okta')}
                      className="w-full py-2 px-3 rounded border border-[#bcc9c6]/40 bg-white hover:bg-[#f2f4f6] text-[#0b1c30] text-[12px] font-medium transition-colors text-center"
                    >
                      Authenticate with Enterprise SAML / Okta
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSSO('Entra')}
                      className="w-full py-2 px-3 rounded border border-[#bcc9c6]/40 bg-white hover:bg-[#f2f4f6] text-[#0b1c30] text-[12px] font-medium transition-colors text-center"
                    >
                      Corporate Microsoft Entra ID
                    </button>
                  </div>

                  <div className="text-center my-3 text-[11px] text-[#565e74]">
                    <span>— or official domain credentials —</span>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-3 text-[12px]">
                    <div>
                      <label className="block text-[#0b1c30] font-medium mb-1" htmlFor="inst-email">
                        Institutional Email Address
                      </label>
                      <input
                        id="inst-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="underwriter@hdfcbank.com"
                        className="w-full px-3 py-2 bg-white border border-[#bcc9c6]/50 rounded text-[13px] text-[#0b1c30] focus:border-[#00685f] focus:outline-none"
                      />
                      <span className="text-[11px] text-[#00685f] mt-1 block">
                        Domain verified: Scheduled Commercial Bank Tier-1
                      </span>
                    </div>

                    <div>
                      <label className="block text-[#0b1c30] font-medium mb-1" htmlFor="mfa-token">
                        Session Security Token (TOTP / Token)
                      </label>
                      <input
                        id="mfa-token"
                        type="password"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        placeholder="Enter 6-digit session pin"
                        className="w-full px-3 py-2 bg-white border border-[#bcc9c6]/50 rounded font-mono text-[13px] text-[#0b1c30] focus:border-[#00685f] focus:outline-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full py-2 px-4 rounded bg-[#00685f] hover:bg-[#005049] text-white text-[13px] font-medium transition-colors"
                      >
                        {isAuthenticating ? 'Validating Credentials...' : authSuccess ? 'Launching Console...' : 'Authenticate & Launch Console'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regulatory Governance Documentation Index (No generic boxes) */}
        <section className="py-10 bg-white border-b border-[#bcc9c6]/30" id="regulatory-framework">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-[12px] text-[#565e74] uppercase tracking-wider mb-2 font-medium">
              Regulatory Taxonomy & Supervisory Circulars
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[12px]">
              <div className="p-3 border border-[#bcc9c6]/30 rounded bg-[#f8f9ff]">
                <div className="font-semibold text-[#0b1c30]">RBI Disclosure Directive</div>
                <div className="text-[#565e74] mt-0.5">DOR.STR.REC.58/21.04.048/2023-24</div>
                <div className="text-[11px] text-[#565e74] mt-1">Pillar 3 physical climate stress metrics for commercial loan portfolios.</div>
              </div>

              <div className="p-3 border border-[#bcc9c6]/30 rounded bg-[#f8f9ff]">
                <div className="font-semibold text-[#0b1c30]">NGFS Phase IV Scenarios</div>
                <div className="text-[#565e74] mt-0.5">SSP2-4.5 & SSP5-8.5 Pathways</div>
                <div className="text-[11px] text-[#565e74] mt-1">Mid-century (2040) and net-zero (2050) forward shock models.</div>
              </div>

              <div className="p-3 border border-[#bcc9c6]/30 rounded bg-[#f8f9ff]">
                <div className="font-semibold text-[#0b1c30]">SEBI BRSR Core Mandate</div>
                <div className="text-[#565e74] mt-0.5">Value Chain Physical Risk</div>
                <div className="text-[11px] text-[#565e74] mt-1">Scope 3 supply chain physical vulnerability quantification.</div>
              </div>

              <div className="p-3 border border-[#bcc9c6]/30 rounded bg-[#f8f9ff]">
                <div className="font-semibold text-[#0b1c30]">Basel Committee BCBS</div>
                <div className="text-[#565e74] mt-0.5">Climate Financial Risks 2022</div>
                <div className="text-[11px] text-[#565e74] mt-1">Supervisory review capital buffer and ECL degradation standards.</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Human Corporate Footer with Real Structural Links */}
      <footer className="bg-[#f8f9ff] py-8 text-[#565e74] text-[12px] border-t border-[#bcc9c6]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-[#bcc9c6]/20">
            <div>
              <div className="font-semibold text-[#0b1c30] mb-2">Climoid Engine</div>
              <ul className="space-y-1 text-[11px]">
                <li><a href="#" className="hover:underline">Sentinel-2 Ingestion Pipeline</a></li>
                <li><a href="#" className="hover:underline">ECMWF Micro-Basin HydroNet</a></li>
                <li><a href="#" className="hover:underline">IMD AWS Real-time Telemetry</a></li>
                <li><a href="#" className="hover:underline">IRAC Norms & ECL Calibration</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-[#0b1c30] mb-2">Underwriting Consoles</div>
              <ul className="space-y-1 text-[11px]">
                <li><button onClick={() => onEnterConsole('dashboard')} className="hover:underline">Portfolio Dashboard</button></li>
                <li><button onClick={() => onEnterConsole('map')} className="hover:underline">Spatial Basin Explorer</button></li>
                <li><button onClick={() => onEnterConsole('borrowers')} className="hover:underline">Borrower Credit Console</button></li>
                <li><button onClick={() => onEnterConsole('alerts')} className="hover:underline">Early Warning Alerts</button></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-[#0b1c30] mb-2">Regulatory Disclosures</div>
              <ul className="space-y-1 text-[11px]">
                <li><a href="#" className="hover:underline">RBI Pillar 3 XBRL Schema</a></li>
                <li><a href="#" className="hover:underline">TCFD Risk Packs</a></li>
                <li><a href="#" className="hover:underline">SEBI BRSR Scope 3 Telemetry</a></li>
                <li><a href="#" className="hover:underline">Model Governance Charter</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-[#0b1c30] mb-2">Legal & Information Security</div>
              <ul className="space-y-1 text-[11px]">
                <li><a href="#" className="hover:underline">SOC2 Type II Attestation</a></li>
                <li><a href="#" className="hover:underline">ISO 27001 Certification</a></li>
                <li><a href="#" className="hover:underline">DPDP Act (India 2023) Compliance</a></li>
                <li><a href="#" className="hover:underline">SecOps Incident Response</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div>
              © 2026 Climoid Analytics Technologies Pvt. Ltd. · Registered Office: Nariman Point, Mumbai 400021 · Engineering Center: Indiranagar, Bengaluru 560038
            </div>
            <div className="font-mono text-[#565e74]">
              Build v2.4.1-rc · Status: Operational (99.98% SLA)
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
