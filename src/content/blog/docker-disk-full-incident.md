---
title: "The night our Docker hosts ran out of disk"
description: "Diagnosing and fixing a recurring 'no space left on device' failure as our microservice count grew, and what I changed so it stopped happening."
pubDate: 2026-09-10
tags:
  - docker
  - incidents
  - devops
---

At Netnology I built and own the backend architecture and the entire
Docker/Compose setup. As we kept adding microservices, one of our hosts
started throwing `no space left on device` &mdash; builds started failing,
then services started failing too. Not a great way to find out your disk
strategy doesn't scale.

## Diagnosis

The failure looked scary but the cause was mundane: image, volume, and log
bloat, compounding as the number of services grew. Every new service added
its own image layers, its own logs, and (for a few of them) its own volume,
and nothing was ever cleaned up. It's the kind of problem that's invisible
until the day it isn't.

## Fix

A few changes, in order of how much they mattered:

- **Multi-stage Dockerfiles** for both the backend and frontend, so build
  tooling never ends up in the final image.
- **Minimal base images** (`python:3.12-slim` instead of the full image),
  cutting image size and the surface area for bloat.
- **BuildKit** enabled, for better layer caching and smaller build contexts.
- **Log rotation** configured for every service, so container logs stop
  growing unbounded.
- **Persistent named volumes scoped to only stateful services** &mdash;
  Postgres, MinIO/uploads &mdash; so stateless containers stopped quietly
  hoarding disk they never needed.

## Prevention

Fixing the immediate problem wasn't enough on its own; disk fills up again
the same way if nothing changes structurally. So:

- A **weekly automated cleanup** of dangling images and unused build cache
  on the long-lived servers.
- **Ephemeral CI runners**, so every build starts from a clean slate and
  leaves nothing behind when it finishes.

## What I'd do differently

I'd put the log rotation and volume scoping in place from day one instead of
as a reaction to a failure &mdash; both are cheap to do upfront and expensive
to retrofit once a dozen services are already depending on the old behavior.
The multi-stage rebuild was worth doing regardless, but I'd rather have made
that call before disk pressure forced it.
