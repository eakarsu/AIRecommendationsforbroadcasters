# Governed broadcast creation operations

## Intended use and limits

The governed API supports rights-aware asset selection, timeline generation, render review, moderation, watermarking, controlled experiments, and publication receipts. It does not establish legal rights, autonomously publish, or auto-promote an experiment winner. Editorial and rights reviewers remain accountable.

## Data and integrations

Signed tenant claims, asset rights windows, model/version provenance, timing/layout/accessibility/brand checks, independent approval, and audit history are mandatory. Media storage, rights, render, moderation, playout, analytics, and delivery actions use a typed, idempotent outbox with leased worker claims, bounded retries, and dead letters.

## Deploy, rollback, and recovery

Run `./start.sh check`, back up PostgreSQL and referenced assets, then use `ALLOW_SCHEMA_MIGRATION=1 ./start.sh migrate`. Reconcile render hashes and publication receipts before replay. Roll back code without deleting evidence. Alert on rights expiry, moderation failures, review divergence, self-approval, inaccessible output, export hash mismatch, and dead letters.
