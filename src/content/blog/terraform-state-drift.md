---
title: "Chasing Terraform state drift in a shared Azure estate"
description: "How recurring, unexplained deployment failures on a client Azure estate turned out to be state drift, and how we caught it before it broke things."
pubDate: 2026-08-20
tags:
  - terraform
  - azure
  - iac
---

While working on a global Oil &amp; Gas client's Azure estate (data-science and
BI environments, provisioned as Terraform in Azure DevOps), we kept hitting
the same shape of problem: a deployment would fail, and the error made no
sense against what was actually in the Terraform config. Nothing had
changed &mdash; at least not through Terraform.

## What was actually happening

The infrastructure had drifted out from under the state file. Someone (or
something) had made a change directly in the Azure portal or via a script
outside of the pipeline, so Terraform's last-known state no longer matched
reality. The next `terraform plan` would either silently plan to "fix" a
change nobody asked for, or fail outright when a resource it expected to
manage had been altered or removed underneath it.

This is one of those failure modes that's obvious in hindsight and
completely opaque in the moment, because the error you see is about the
symptom (a failed apply), not the cause (state that's lying to you).

## What we built

Drift doesn't announce itself, so we needed something to surface it before
it caused a failed deploy rather than after. We built drift detection with
alerting into the workflow, so out-of-band changes got caught and flagged
for reconciliation instead of sitting silently until the next unrelated
deployment tripped over them.

The result wasn't a dramatic before/after number &mdash; it was fewer
unplanned configuration failures, and environments that behaved the way the
Terraform config said they should, which sounds unremarkable until you've
worked in an estate where that wasn't true.

## The underlying lesson

State drift is really a trust problem: Terraform assumes its state file is
the source of truth, and the moment anything else can change infrastructure
directly, that assumption breaks quietly. The fix isn't just tooling, it's
also closing the door that let out-of-band changes happen in the first
place &mdash; though in a large, multi-team estate, some amount of "someone
clicked something in the portal" is realistically never fully eliminated.
Catching it fast is the more durable goal than pretending it won't happen.
