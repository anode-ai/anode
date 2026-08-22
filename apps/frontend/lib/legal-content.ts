// Copy for the Privacy Policy and Terms of Service pages.
// Kept as data so both documents share one renderer in components/anode/legal-document.tsx.
//
// NOTE: this is a starting template written to describe how Anode actually works.
// It is not legal advice and has not been reviewed by a lawyer — have counsel check it
// before relying on it in production.

export interface LegalSection {
  heading: string
  body: string[]
  bullets?: string[]
}

export interface LegalDoc {
  slug: "privacy" | "terms"
  eyebrow: string
  title: string
  summary: string
  updated: string
  sections: LegalSection[]
}

const CONTACT_EMAIL = "hello@anode.ai"

export const PRIVACY_POLICY: LegalDoc = {
  slug: "privacy",
  eyebrow: "Legal / Privacy",
  title: "PRIVACY POLICY",
  summary:
    "What Anode collects, why we collect it, and the choices you have. Written to describe the product as it actually works.",
  updated: "23 August 2026",
  sections: [
    {
      heading: "Who we are",
      body: [
        "Anode provides an AI assistant that embeds into your website. This policy covers the Anode dashboard, the assistant widget we host on your behalf, and the anode.ai marketing site.",
        `If you embed Anode on your own site, you remain the controller of the conversations your visitors have with it, and we process that data on your instructions. Questions about this policy go to ${CONTACT_EMAIL}.`,
      ],
    },
    {
      heading: "What we collect",
      body: ["We collect three kinds of data, and nothing beyond what the product needs to run."],
      bullets: [
        "Account data — your name, email address, and an authentication credential. If you sign in with Google we receive your name, email address, and profile picture from Google. We never see your Google password.",
        "Training data — the URLs, files, and text you add to an assistant, plus the processed text and vector embeddings we derive from them so the assistant can answer questions.",
        "Conversation data — messages exchanged with your assistants, retained so you can review and improve them.",
        "Technical data — IP address, browser type, and aggregate page analytics, used to keep the service running and to spot abuse.",
      ],
    },
    {
      heading: "How we use it",
      body: [
        "We use your data to operate your assistants, authenticate you, respond to support requests, and keep the service secure and available.",
        "We do not sell your data. We do not use your training data or conversations to train our own general-purpose models, and we do not share them with other customers.",
      ],
    },
    {
      heading: "Who processes it with us",
      body: [
        "Anode runs on a small set of infrastructure providers. Each one only receives what it needs to do its job.",
      ],
      bullets: [
        "Supabase — database, authentication, and file storage.",
        "Google — Gemini generates assistant responses, and Google Sign-In handles OAuth if you use it.",
        "Hugging Face — generates the vector embeddings that let an assistant search your training data.",
        "Vercel — hosting and aggregate, privacy-preserving page analytics.",
      ],
    },
    {
      heading: "Cookies",
      body: [
        "We set cookies that keep you signed in and secure your session. These are required for the dashboard to function and cannot be switched off while you are logged in.",
        "We do not use advertising cookies and we do not run third-party ad trackers.",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        "Training data and conversations are kept while your assistant exists. Delete an assistant and its sources and transcripts are removed.",
        "Close your account and we delete your account data, subject to any records we are legally required to retain. Backups age out on their own schedule.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You can access, correct, export, or delete your data at any time from the dashboard, or by emailing us.",
        `Depending on where you live you may also have the right to object to or restrict processing, or to lodge a complaint with your local data protection authority. Write to ${CONTACT_EMAIL} and we will respond within 30 days.`,
      ],
    },
    {
      heading: "Security",
      body: [
        "Data is encrypted in transit and at rest, and access to production systems is limited to the people who need it.",
        "No system is perfectly secure. If a breach affects your data we will tell you and the relevant regulator as required by law.",
      ],
    },
    {
      heading: "Children",
      body: [
        "Anode is not intended for anyone under 16 and we do not knowingly collect data from children. If you believe a child has given us data, contact us and we will delete it.",
      ],
    },
    {
      heading: "Changes",
      body: [
        "If we change this policy we will update the date at the top of this page. For material changes affecting how we handle your data, we will email you before they take effect.",
      ],
    },
  ],
}

export const TERMS_OF_SERVICE: LegalDoc = {
  slug: "terms",
  eyebrow: "Legal / Terms",
  title: "TERMS OF SERVICE",
  summary:
    "The agreement between you and Anode. Plain terms covering accounts, your content, AI output, and the limits of what we promise.",
  updated: "23 August 2026",
  sections: [
    {
      heading: "Agreement",
      body: [
        "By creating an account or using Anode you agree to these terms. If you are agreeing on behalf of a company, you confirm you have authority to bind it.",
        "If you do not agree, do not use the service.",
      ],
    },
    {
      heading: "Your account",
      body: [
        "You are responsible for the accuracy of your account details, for keeping your credentials secure, and for everything that happens under your account.",
        "Tell us promptly if you suspect unauthorised access. You must be at least 16 years old to hold an account.",
      ],
    },
    {
      heading: "Acceptable use",
      body: ["You agree not to use Anode to do any of the following."],
      bullets: [
        "Break the law, or infringe someone else's intellectual property or privacy rights.",
        "Upload training data you do not have the right to use.",
        "Generate content that is unlawful, deceptive, harassing, or designed to impersonate a real person or organisation.",
        "Probe, scrape, overload, or reverse engineer the service, or circumvent its rate limits and access controls.",
        "Resell or white-label the hosted service without our written agreement.",
      ],
    },
    {
      heading: "Your content",
      body: [
        "You keep ownership of everything you upload. You grant us only the licence we need to host, process, and display that content in order to run your assistants — nothing wider, and it ends when you delete the content.",
        "You are responsible for having the rights to the data you train on, and for what your assistants say to your visitors as a result.",
      ],
    },
    {
      heading: "AI output",
      body: [
        "Anode generates responses with language models. Output can be wrong, incomplete, or misleading even when it reads confidently, and it is not professional advice.",
        "Review output before relying on it, and do not present it to your users as verified fact without checking. You are responsible for how your assistant behaves on your site.",
      ],
    },
    {
      heading: "Fees",
      body: [
        "The Dev SDK is free and open source. Public and Private modes are billed as a one-time setup fee for a managed install, as described on our pricing page at the time you buy.",
        "Fees are stated exclusive of tax unless we say otherwise. Setup fees are non-refundable once the install work has started.",
      ],
    },
    {
      heading: "Intellectual property",
      body: [
        "Anode owns the service, its software, and its branding, and these terms do not transfer any of that to you.",
        "The open-source components are licensed separately under their own terms, which take precedence for those components.",
      ],
    },
    {
      heading: "Availability",
      body: [
        "We work to keep Anode available but we do not promise uninterrupted service. We may change, suspend, or discontinue features, and we will give reasonable notice before removing something you depend on.",
        "We may suspend an account immediately if it puts the service or other users at risk.",
      ],
    },
    {
      heading: "Termination",
      body: [
        "You can stop using Anode and delete your account at any time. We may terminate an account that breaches these terms.",
        "On termination your right to use the service ends and we delete your data as described in the Privacy Policy.",
      ],
    },
    {
      heading: "Disclaimers and liability",
      body: [
        'The service is provided "as is", without warranties of any kind to the extent the law allows.',
        "We are not liable for indirect, incidental, or consequential losses, or for lost profits or data. Our total liability is capped at the amount you paid us in the twelve months before the claim.",
        "Nothing here excludes liability that cannot be excluded by law.",
      ],
    },
    {
      heading: "Changes",
      body: [
        "We may update these terms. The date at the top of this page shows the current version, and we will notify you of material changes before they take effect. Continuing to use Anode after that means you accept the new terms.",
      ],
    },
    {
      heading: "Contact",
      body: [`Questions about these terms: ${CONTACT_EMAIL}.`],
    },
  ],
}
