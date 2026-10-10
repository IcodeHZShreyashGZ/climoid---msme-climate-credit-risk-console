export type TabType =
  | 'dashboard'
  | 'map'
  | 'borrowers'
  | 'compare'
  | 'alerts'
  | 'scenarios'
  | 'portfolio'
  | 'reports'
  | 'settings'
  | 'landing';

export type TimeHorizon = 'now' | '7day' | '90day' | '2050';

export type HazardType = 'flood' | 'heat' | 'drought' | 'storm' | 'satellite';

export type RiskGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface BorrowerRecord {
  id: string;
  name: string;
  msmeId: string;
  gstin: string;
  sector: string;
  subSector?: string;
  location: string;
  district: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  facilityAmountCr: number;
  facilityType: string;
  tenorMonths: number;
  baseCreditScore: number;
  climateAdjustedScore: number;
  climateDragPoints: number;
  climateDragPercent: number;
  riskBand: RiskGrade;
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  basePdPercent: number;
  adjustedPdPercent: number;
  revenueAtRiskCr: number;
  revenueAtRiskPercent: number;
  annualTurnoverCr: number;
  riverBufferDistanceM: number;
  elevationMsl: number;
  waterbodyName: string;
  satelliteImage: string;
  floodDepthModeledM: number;
  supplyRouteDowntimeDays: number;
  mitigationScoreDelta: number;
  recommendedSpreadAdjustmentBps: number;
  recommendedCovenants: string[];
}

export interface ClimateAlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'Severe' | 'Extreme' | 'Watch' | 'Assessment' | 'Site Audit' | 'Covenant Active' | 'WC Injected' | 'Receded' | 'Mitigated';
  category: 'Flood' | 'Heat' | 'Storm' | 'Drought' | 'Surge';
  timeAgo: string;
  timeWindow?: string;
  exposureAtRiskCr: number;
  borrowerCount: number;
  affectedSectors: string;
  assignedLead?: string;
  column: 'new' | 'review' | 'action' | 'resolved';
  actionTakenChips?: string[];
  recommendedAction: string;
  actionIcon: string;
  statusNotes?: string;
}

export interface ScenarioSettings {
  pathway: 'SSP2-4.5' | 'SSP5-8.5';
  timeHorizon: 2030 | 2040 | 2050;
  floodDepthMultiplier: number;
  heatwaveDaysAdded: number;
  droughtIndexMultiplier: number;
}

export interface ScenarioRunResult {
  baseScore: number;
  stressedScore: number;
  scoreDrop: number;
  baseExpectedLossCr: number;
  stressedExpectedLossCr: number;
  expectedLossShockPercent: number;
  basePdPercent: number;
  stressedPdPercent: number;
  stressedPdBps: number;
  cet1BasePercent: number;
  cet1StressedPercent: number;
  requiredProvisionCr: number;
}
