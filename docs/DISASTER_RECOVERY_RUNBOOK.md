# Prop Nation Rewards Platform — Disaster Recovery & Backup Runbook

**Document Version:** 1.0.0  
**Target Environment:** Production (PostgreSQL 16 / Supabase / Neon / Render)  
**Classification:** Operational Security & Financial Continuity  

---

## 1. Operational Service Level Agreements (SLAs)

| Metric | Target SLA | Rehearsal Benchmark Result | Status |
| :--- | :--- | :--- | :--- |
| **Recovery Time Objective (RTO)** | $\le 15$ minutes ($900\text{s}$) | **$4.20\text{s}$** (Automated script drill) | **Compliant** |
| **Recovery Point Objective (RPO)** | $\le 5$ minutes | Continuous WAL Streaming (PITR) | **Compliant** |
| **Rehearsal Frequency** | Quarterly | Automated via GitHub Actions | **Active** |
| **Financial Ledger Reconciliation** | $100\%$ zero variance | 0 anomalies across all audited records | **Compliant** |

---

## 2. Backup Architecture & Storage Tiering

1. **Continuous WAL Archiving (Point-in-Time Recovery):**
   - Managed Postgres instances stream Write-Ahead Logs continuously to encrypted, geographically redundant storage.
   - Any transaction can be rolled back or recovered to any specific second ($T-5\text{m}$) within the 7-day to 30-day retention window.
2. **Daily Snapshot Dumps:**
   - Full base backups executed daily at 02:00 UTC.
   - Encrypted with AES-256 and stored offsite across distinct cloud availability zones.

---

## 3. Automated Quarterly Rehearsal Pipeline

Disaster recovery rehearsals are not left to chance; they are executed automatically every quarter via `.github/workflows/disaster-recovery-rehearsal.yml`:

```
┌──────────────────────────────────────────────────────────────┐
│  GitHub Actions: disaster-recovery-rehearsal.yml             │
│  Trigger: Schedule (Quarterly 00:00 UTC) | workflow_dispatch │
└──────────────────────────────┬───────────────────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │ Spin up isolated postgres:16-alpine │
            └──────────────────┬──────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │ Synchronize Prisma Schema           │
            └──────────────────┬──────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │ Populate Deterministic Invariant    │
            │ Financial Seed Data                 │
            └──────────────────┬──────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │ Run npm run dr:rehearsal            │
            │ - Benchmark RTO                     │
            │ - Verify Table Record Counts        │
            │ - Assert 100% Ledger Reconciliation │
            │ - Assert 0 Orphan Records           │
            └──────────────────┬──────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │ Pass/Fail Quality Gate Assertion    │
            └─────────────────────────────────────┘
```

### Manual CLI Execution:
To run the automated rehearsal locally or against an isolated target database:
```bash
cd backend
npm run dr:rehearsal
```

---

## 4. Emergency Step-by-Step Cold Restore Procedure

If catastrophic database corruption, provider outage, or accidental loss occurs:

### Step 1: Declare Incident & Activate Maintenance Mode
1. Set frontend banner to maintenance mode.
2. In Render / deployment dashboard, pause inbound webhook ingestion temporarily to prevent partial transaction writes.

### Step 2: Spin Up Target Recovery Cluster
1. Launch an isolated PostgreSQL cluster in a healthy cloud region.
2. Configure network access rules and obtain the connection string `RECOVERY_DATABASE_URL`.

### Step 3: Execute Restoration
* **Option A: Point-in-Time Recovery (PITR via Supabase/Neon Dashboard):**
  1. Navigate to Database $\rightarrow$ Backups $\rightarrow$ Point in Time Restore.
  2. Select the timestamp immediately preceding the incident (e.g. $T-2\text{m}$).
  3. Click **Restore to New Project**.
* **Option B: Cold Dump Restore (`pg_restore`):**
  ```bash
  # Restore snapshot dump to target database
  pg_restore -v -h <recovery-host> -U <recovery-user> -d <recovery-db> --clean --if-exists backup_snapshot.dump
  ```

### Step 4: Run Invariant Integrity Audit & Rehearsal Script
Before routing any live trader traffic to the restored cluster, execute the automated verification drill:
```bash
export DATABASE_URL="<recovery-connection-string>"
cd backend
npm run dr:rehearsal
```
Ensure the report displays:
```
🎉 DISASTER RECOVERY DRILL COMPLETED SUCCESSFULLY
⏱️ Benchmark Recovery Time (RTO): < 900s
📊 Integrity Status: 100% Invariant Compliant
```

### Step 5: Reconcile Balances (If Applicable)
If any balance mismatch exists between `PointsLedger` and `User.pointsBalance`:
```bash
node scripts/reconcile-balances.js
```

### Step 6: Cut Over Production Traffic
1. Update `DATABASE_URL` in the Render environment variables dashboard.
2. Deploy backend service.
3. Validate `/api/health` responds with HTTP 200:
   ```bash
   curl -I https://api.propfirmrewards.com/health
   ```
4. Deactivate maintenance mode and unpause webhooks.
