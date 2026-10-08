import { Module } from '@nestjs/common';

// Applicant Tracking System (ATS) — greenfield module slot.
// No controllers/providers exist yet; registered so the app module boundary
// for the future ATS domain (requisitions, candidates, offers) is in place.
@Module({})
export class ATSModule {}
