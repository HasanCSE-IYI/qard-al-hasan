# Qard al-Hasan (Benevolent Loan) Management Ecosystem 🕊️

> **"Who is it that will lend to Allah a good loan (Qard al-Hasan) so that He may multiply it for him many times over and there is for him an honorable reward?"** — (Surah Al-Hadid: 11)

A modern, 100% interest-free (Riba-free), transparent, and Shariah-compliant Islamic FinTech ecosystem. Engineered for individuals, families, mosques, and community welfare trusts to manage benevolent loans, installment tracking, Islamic inheritance debt clearance (Al-Wasiyyah), and voluntary debt forgiveness (Al-Ibra / Sadaqah).

---

## 🌟 Key Features

- 🚫 **Zero-Riba & No Hidden Charges:** Completely free from interest, late payment penalties, service markups, or processing surcharges.
- 📝 **Digital Aqd Contracts (Surah Al-Baqarah: 282):** Automated bilateral loan agreement generation with witness countersignatures and cryptographic SHA-256 integrity hashes.
- ⏳ **Inzar al-Mu'sir (Grace Period / Rescheduling):** Compassionate term extensions for financially strained borrowers without compound penalties or coercive measures (Surah Al-Baqarah: 280).
- 🤲 **Al-Ibra (Voluntary Debt Forgiveness / Sadaqah):** Formal waiver workflows enabling creditors to forgive whole or partial loans as certified charity.
- 📜 **Al-Wasiyyah (Islamic Inheritance & Debt Clearance):** Instant generation and export of certified debt statements ensuring liabilities are settled prior to estate distribution (Sahih al-Bukhari: 2738).
- 📱 **Mobile Financial Services (bKash & Nagad) Parser:** Instant regex parsing of transaction SMS texts to auto-populate Transaction ID and repayment amount.
- 🔒 **Privacy & Islamic Aesthetic Design:** Clean Islamic FinTech design with Emerald & Gold accents, status tracking, and privacy-conscious balance hiding.
- ☁️ **Cloudflare Free-Tier Architecture:** Powered globally by Cloudflare Workers (Edge runtime), D1 (Distributed SQLite), R2 (Receipt storage), and KV.

---

## 🏛️ Monorepo Architecture

```text
/
├── backend/        # Cloudflare Workers API (Hono + Drizzle ORM + D1 SQLite + R2 Storage)
├── mobile/         # React Native Cross-Platform App (TypeScript + Zustand + Offline MFS Parser)
├── shared/         # Shared domain models, Zod validation schemas, and TypeScript interfaces
├── package.json    # Monorepo workspaces orchestration
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Backend Local Development
```bash
npm run dev:backend
```
The local Cloudflare Workers dev server runs at `http://127.0.0.1:8787` backed by an in-memory/file-based SQLite D1 compatibility bridge.

### 3. Run Mobile Application
```bash
npm run start:mobile
```

### 4. Build Android Debug APK
```bash
cd mobile/android
gradle assembleDebug
```
The resulting APK is generated at:
`mobile/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📜 Shariah & Islamic Governance Framework

- **The Holy Quran:**
  - Surah Al-Baqarah (2:280) — Postponement for borrowers in hardship & virtue of forgiving debt as charity.
  - Surah Al-Baqarah (2:282) — Commandment to record all debt transactions in writing with witnesses.
  - Surah Al-Hadid (57:11) — The spiritual merit of offering benevolent loans for the sake of Allah.
- **Sahih al-Bukhari:**
  - Hadith 2390 — Good repayment ethics and Husn al-Qada (courtesy in settlement).
  - Hadith 2738 — Obligation to record debts and wills (Al-Wasiyyah) within two nights.
- **AAOIFI Shariah Standard No. 19:**
  - Governance on benevolent lending, prohibition of stipulated benefit to the lender, and actual administrative expense boundaries.

---

## 👨‍💻 Author & License

- **Developer:** Mahmud al Hasan ([@HasanCSE-IYI](https://github.com/HasanCSE-IYI))
- **License:** [MIT License](LICENSE)
