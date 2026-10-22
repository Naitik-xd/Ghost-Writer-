/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Fragment, IntentReconstruction, RecoveryPlan } from '../types';

export const DEMO_PROJECT_ID = 'demo-hyperlocal-sync';

export const DEMO_PROJECT: Project = {
  id: DEMO_PROJECT_ID,
  title: 'HyperLocal: Offline-First Peer Sync Engine',
  description: 'An open-source distributed peer-to-peer sync engine for mobile devices in remote or low-connectivity environments.',
  category: 'Distributed Systems & Mobile',
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35, // 35 days ago
  updatedAt: Date.now() - 1000 * 60 * 60 * 4,
  isDemo: true,
};

export const DEMO_FRAGMENTS: Fragment[] = [
  {
    id: 'frag-1',
    projectId: DEMO_PROJECT_ID,
    title: 'Core Architecture Notes (March Session)',
    type: 'note',
    extractedText: `# Core Sync Architecture
- Goal: Enable mobile phones in field research or low-connectivity disaster relief to share medical logs and triage records without internet.
- Primary requirement: Sub-second local replication between peer nodes within physical range.
- Storage strategy: Local SQLite / IndexedDB stores CRDT state (LWW-Element-Set or state-based delta sync).
- Identity: Cryptographic Ed25519 keypairs generated on-device, zero phone numbers or centralized auth servers.`,
    isVerified: true,
    confidence: 100,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
  },
  {
    id: 'frag-2',
    projectId: DEMO_PROJECT_ID,
    title: 'Whiteboard Diagram: Peer Discovery Matrix',
    type: 'screenshot',
    mediaUrl: 'https://placehold.co/800x450/e2e8f0/334155?text=Whiteboard:+Peer+Discovery+Matrix',
    extractedText: `[Architecture Diagram: Peer Discovery Matrix]
1. Node A advertises ephemeral BLE service UUID: 0xFD42 with compact 8-byte bloom filter of known state.
2. Node B detects BLE beacon -> compares bloom filter -> initiates local Wi-Fi Direct handshake if deltas exist.
3. Cryptographic channel: Noise Protocol Framework (XX handshake pattern for mutual verification).
4. Power Constraint: Continuous background scanning must not exceed 4% battery consumption per hour.
5. Critical Question: What happens when 60+ nodes enter close proximity (radio beacon saturation)?`,
    isVerified: true,
    confidence: 94,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
  },
  {
    id: 'frag-3',
    projectId: DEMO_PROJECT_ID,
    title: 'Napkin Note: CRDT Overhead & Mobile Constraints',
    type: 'handwriting',
    isHandwritingExperimental: true,
    extractedText: `CRDT observation: Vector clocks grow too large for [unreadable] nodes over 7 days of disconnected operation.
Switching from naive state sync to Merkle-tree bucket diffing (like bamboo or willow protocol).
Test bench currently blocked by Android 14 background BLE advertising restrictions.
Need to check if Wi-Fi Aware (NAN) is mature on iOS.`,
    isVerified: true,
    confidence: 76,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
  },
  {
    id: 'frag-4',
    projectId: DEMO_PROJECT_ID,
    title: 'Transport Layer Spec Amendment (Unresolved Contradiction)',
    type: 'document',
    extractedText: `Section 3.2 Transport Protocols:
Early draft statement: "All local peer discovery and payload exchange runs over local WebSocket tunnels on port 8443 via mDNS announcements."
Subsequent amendment: "WebSockets dropped due to iOS background termination; replace with BLE GATT packet chunks and UDP multicast."
Status: Codebase is stranded mid-refactor. The Go backend still contains half-migrated WebSocket listeners, while the Swift iOS wrapper has uncompiled BLE GATT chunking code.`,
    isVerified: true,
    confidence: 98,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
];

export const DEMO_INTENT: IntentReconstruction = {
  projectId: DEMO_PROJECT_ID,
  goal: 'Build an ultra-reliable, zero-internet peer-to-peer data synchronization engine for field workers and disaster response teams using decentralized CRDTs.',
  targetAudience: 'Off-grid field researchers, humanitarian disaster relief teams, and local-first application developers.',
  decisions: [
    {
      id: 'dec-1',
      title: 'Decentralized Cryptographic Identity',
      rationale: 'Nodes use self-generated Ed25519 keypairs so user identities function without cellular signal or central servers.',
      fragmentIds: ['frag-1'],
    },
    {
      id: 'dec-2',
      title: 'Noise Protocol XX Handshake for Mutual Auth',
      rationale: 'Establishes encrypted communication over untrusted local wireless channels without pre-shared server credentials.',
      fragmentIds: ['frag-2'],
    },
    {
      id: 'dec-3',
      title: 'Transition from Vector Clocks to Merkle-Tree Diffing',
      rationale: 'Vector clocks accumulated prohibitive memory overhead after 7+ days of intermittent mobile partition.',
      fragmentIds: ['frag-3'],
    },
  ],
  constraints: [
    'Strict background battery drain budget of ≤4% per hour on mobile devices.',
    'Zero cloud dependency; all discovery and replication must complete entirely over physical ad-hoc wireless links.',
    'Android 14 background BLE advertising restrictions limit continuous background discovery.',
  ],
  contradictions: [
    {
      id: 'contra-1',
      issue: 'Conflicting Transport Architecture (WebSockets vs. BLE GATT + UDP Multicast)',
      fragmentIds: ['frag-4', 'frag-1'],
      suggestedResolution: 'Decommission legacy WebSocket listeners. Finalize BLE GATT chunking for discovery and fallback to Wi-Fi Direct / UDP multicast for large payload sync.',
    },
  ],
  verifiedFacts: [
    {
      id: 'fact-1',
      fact: 'Ed25519 identity keypairs are generated client-side with zero central auth.',
      fragmentId: 'frag-1',
    },
    {
      id: 'fact-2',
      fact: 'Ephemeral BLE Service UUID 0xFD42 is used for beacon advertisements.',
      fragmentId: 'frag-2',
    },
    {
      id: 'fact-3',
      fact: 'iOS terminates long-lived background WebSocket listeners, making them unviable.',
      fragmentId: 'frag-4',
    },
  ],
  assumptions: [
    {
      id: 'assump-1',
      assumption: 'Wi-Fi Aware (NAN) is not sufficiently standardized across iOS and Android to serve as the primary transport.',
      confidence: 'high',
      requiresConfirmation: true,
      userConfirmed: false,
    },
    {
      id: 'assump-2',
      assumption: 'Maximum cluster size per physical area will rarely exceed 30 active peer nodes in initial deployment.',
      confidence: 'medium',
      requiresConfirmation: true,
      userConfirmed: true,
    },
  ],
  lastAnalyzedAt: Date.now() - 1000 * 60 * 60 * 3,
};

export const DEMO_RECOVERY_PLAN: RecoveryPlan = {
  projectId: DEMO_PROJECT_ID,
  completed: [
    'CRDT state schema design with LWW-Element-Set.',
    'Ed25519 cryptographic key generation on device.',
    'Basic BLE beacon packet encoding with 8-byte bloom filter.',
  ],
  unfinished: [
    'Half-migrated BLE GATT packet chunking implementation in Swift wrapper.',
    'Merkle-tree delta reconciliation logic to replace naive vector clocks.',
    'Background service lifecycle management on Android 14.',
  ],
  blocked: [
    'Conflicting transport layers: codebase has orphaned Go WebSocket listeners while iOS branch expects BLE/UDP.',
    'Android 14 aggressive background BLE restrictions prevent continuous discovery without foreground notification.',
  ],
  unknowns: [
    'Maximum throughput over BLE GATT when transferring files >500KB.',
    'Cross-platform Wi-Fi Direct negotiation reliability between iOS and Samsung Android devices.',
  ],
  immediateSprint: [
    {
      id: 'sprint-1',
      step: 1,
      priority: 'critical',
      task: 'Resolve Transport Contradiction: Purge orphaned WebSocket listeners and lock BLE + UDP as sole transport.',
      rationale: 'Unblocks both Swift and Go builds by standardizing on a single ad-hoc transport interface.',
    },
    {
      id: 'sprint-2',
      step: 2,
      priority: 'high',
      task: 'Implement Foreground Service Notification for Android 14 background beaconing.',
      rationale: 'Overcomes OS permission blocks so background discovery can function reliably.',
    },
    {
      id: 'sprint-3',
      step: 3,
      priority: 'medium',
      task: 'Bench-test Merkle-tree bucket exchange against 1,000 synthetic offline records.',
      rationale: 'Validates that memory consumption remains constant regardless of disconnect duration.',
    },
  ],
  lastGeneratedAt: Date.now() - 1000 * 60 * 60 * 3,
};
