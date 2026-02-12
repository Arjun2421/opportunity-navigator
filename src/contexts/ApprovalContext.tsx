import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type ApprovalStatus = 'pending' | 'proposal_head_approved' | 'fully_approved';

export interface ApprovalLogEntry {
  id: string;
  opportunityId: string;
  action: 'proposal_head_approved' | 'svp_approved' | 'reverted';
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  group?: string;
}

interface ApprovalState {
  proposalHeadApproved: boolean;
  proposalHeadBy?: string;
  proposalHeadAt?: string;
  svpApproved: boolean;
  svpBy?: string;
  svpAt?: string;
}

interface ApprovalContextType {
  approvals: Record<string, ApprovalState>;
  approvalLogs: ApprovalLogEntry[];
  getApprovalStatus: (opportunityId: string) => ApprovalStatus;
  getApprovalState: (opportunityId: string) => ApprovalState;
  approveAsProposalHead: (opportunityId: string, performedBy: string) => void;
  approveAsSVP: (opportunityId: string, performedBy: string, group: string) => void;
  revertApproval: (opportunityId: string, performedBy: string, performedByRole: string) => void;
  refreshApprovals: () => void;
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

const defaultApprovalState: ApprovalState = {
  proposalHeadApproved: false,
  svpApproved: false,
};

export function ApprovalProvider({ children }: { children: ReactNode }) {
  const [approvals, setApprovals] = useState<Record<string, ApprovalState>>(() => {
    const saved = localStorage.getItem('tender_approvals_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  const [approvalLogs, setApprovalLogs] = useState<ApprovalLogEntry[]>(() => {
    const saved = localStorage.getItem('approval_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tender_approvals_v2', JSON.stringify(approvals));
  }, [approvals]);

  useEffect(() => {
    localStorage.setItem('approval_logs', JSON.stringify(approvalLogs));
  }, [approvalLogs]);

  const getApprovalState = useCallback((opportunityId: string): ApprovalState => {
    return approvals[opportunityId] || defaultApprovalState;
  }, [approvals]);

  const getApprovalStatus = useCallback((opportunityId: string): ApprovalStatus => {
    const state = approvals[opportunityId];
    if (!state) return 'pending';
    if (state.svpApproved) return 'fully_approved';
    if (state.proposalHeadApproved) return 'proposal_head_approved';
    return 'pending';
  }, [approvals]);

  const approveAsProposalHead = useCallback((opportunityId: string, performedBy: string) => {
    setApprovals((prev) => {
      const existing = prev[opportunityId] || { ...defaultApprovalState };
      if (existing.proposalHeadApproved) return prev;
      return {
        ...prev,
        [opportunityId]: {
          ...existing,
          proposalHeadApproved: true,
          proposalHeadBy: performedBy,
          proposalHeadAt: new Date().toISOString(),
        },
      };
    });
    setApprovalLogs((prev) => [
      {
        id: crypto.randomUUID(),
        opportunityId,
        action: 'proposal_head_approved',
        performedBy,
        performedByRole: 'Proposal Head',
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const approveAsSVP = useCallback((opportunityId: string, performedBy: string, group: string) => {
    setApprovals((prev) => {
      const existing = prev[opportunityId] || { ...defaultApprovalState };
      if (!existing.proposalHeadApproved || existing.svpApproved) return prev;
      return {
        ...prev,
        [opportunityId]: {
          ...existing,
          svpApproved: true,
          svpBy: performedBy,
          svpAt: new Date().toISOString(),
        },
      };
    });
    setApprovalLogs((prev) => [
      {
        id: crypto.randomUUID(),
        opportunityId,
        action: 'svp_approved',
        performedBy,
        performedByRole: `SVP (${group})`,
        timestamp: new Date().toISOString(),
        group,
      },
      ...prev,
    ]);
  }, []);

  const revertApproval = useCallback((opportunityId: string, performedBy: string, performedByRole: string) => {
    setApprovals((prev) => {
      const existing = prev[opportunityId];
      if (!existing) return prev;
      const copy = { ...prev };
      delete copy[opportunityId];
      return copy;
    });
    setApprovalLogs((prev) => [
      {
        id: crypto.randomUUID(),
        opportunityId,
        action: 'reverted',
        performedBy,
        performedByRole,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const refreshApprovals = useCallback(() => {
    const savedApprovals = localStorage.getItem('tender_approvals_v2');
    if (savedApprovals) {
      try {
        setApprovals(JSON.parse(savedApprovals));
      } catch {}
    }
    const savedLogs = localStorage.getItem('approval_logs');
    if (savedLogs) {
      try {
        setApprovalLogs(JSON.parse(savedLogs));
      } catch {}
    }
  }, []);

  return (
    <ApprovalContext.Provider value={{
      approvals,
      approvalLogs,
      getApprovalStatus,
      getApprovalState,
      approveAsProposalHead,
      approveAsSVP,
      revertApproval,
      refreshApprovals,
    }}>
      {children}
    </ApprovalContext.Provider>
  );
}

export function useApproval() {
  const context = useContext(ApprovalContext);
  if (context === undefined) {
    throw new Error('useApproval must be used within an ApprovalProvider');
  }
  return context;
}
