import Link from "next/link";
import { ArrowLeft, BookOpen, Shield, Users, FileText, AlertTriangle, Mail } from "lucide-react";

export default function TermsPage() {
  const lastUpdated = "February 2026";

  const sections = [
    {
      icon: BookOpen,
      title: "1. About SPARK",
      content: `SPARK (Special Problems Archive for Research and Knowledge) is an academic repository maintained by the University of the Philippines. It serves as a centralized platform for storing, sharing, and discovering undergraduate special problem research outputs submitted by students and validated by faculty members.`,
    },
    {
      icon: Users,
      title: "2. Eligibility and Accounts",
      content: `Access to SPARK is restricted to members of the University of the Philippines community, including currently enrolled students, faculty members, and authorized administrative staff. You must use your official institutional email address to register. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Accounts found to be misused or shared may be suspended or terminated.`,
    },
    {
      icon: FileText,
      title: "3. Submission of Research",
      content: `By submitting a special problem or research output to SPARK, you affirm that: (a) the work is your original creation or you have obtained all necessary rights to submit it; (b) the submission does not infringe upon any third-party intellectual property rights; (c) the content does not contain plagiarized material; and (d) you grant the University of the Philippines a non-exclusive, royalty-free license to store, display, and distribute the work within the platform for academic and research purposes.`,
    },
    {
      icon: Shield,
      title: "4. Intellectual Property",
      content: `All research outputs submitted to SPARK remain the intellectual property of their respective authors, subject to the policies of the University of the Philippines on student and faculty research. Downloads and access to research materials are intended for academic, educational, and non-commercial purposes only. Reproduction, redistribution, or commercial use of any content without the explicit written consent of the author is strictly prohibited.`,
    },
    {
      icon: AlertTriangle,
      title: "5. Prohibited Conduct",
      content: `Users of SPARK agree not to: (a) submit content that is false, misleading, defamatory, or plagiarized; (b) attempt to gain unauthorized access to other user accounts or restricted sections of the platform; (c) use automated tools, bots, or scrapers to extract content in bulk; (d) upload malicious files or attempt to compromise platform security; or (e) harass, threaten, or harm other users of the platform. Violations may result in immediate account suspension and referral to the appropriate university disciplinary body.`,
    },
    {
      icon: Mail,
      title: "6. Privacy and Data",
      content: `SPARK collects and stores personal information including your name, email address, department, and student identification number for the purpose of account management and research attribution. This information is handled in accordance with the data privacy policies of the University of the Philippines and applicable Philippine law, including the Data Privacy Act of 2012 (Republic Act No. 10173). Your personal data will not be sold or shared with third parties outside the university without your explicit consent.`,
    },
  ];

  return (
    <div className="min-h-screen bg-parchment-50">

      {/* Header */}
      <div className="border-b border-maroon-100 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
              <span className="text-parchment-100 font-serif font-bold text-xs">SP</span>
            </div>
            <span className="font-serif text-maroon-800 font-semibold">SPARK</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-maroon-500 hover:text-maroon-800 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #6b0f24 0%, #8f1535 40%, #5a0c1c 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #faf3e0 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-1 bg-upgreen-500" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-14">
          <p className="text-upgreen-300 text-xs tracking-widest uppercase mb-3">Legal</p>
          <h1 className="font-serif text-4xl text-parchment-100 mb-3">Terms of Use</h1>
          <p className="text-parchment-400 text-sm leading-relaxed max-w-xl">
            Please read these terms carefully before using the SPARK academic repository platform.
            By accessing or using SPARK, you agree to be bound by these terms.
          </p>
          <p className="text-parchment-500 text-xs mt-4">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Intro box */}
        <div className="bg-white rounded-xl border border-maroon-100 p-6 mb-8 shadow-sm">
          <p className="text-maroon-700 text-sm leading-relaxed">
            These Terms of Use govern your access to and use of SPARK, the Special Problems Archive for Research and Knowledge,
            operated by the University of the Philippines. By creating an account or accessing content on this platform,
            you acknowledge that you have read, understood, and agree to be bound by these terms.
            If you do not agree, please do not use this platform.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="bg-white rounded-xl border border-maroon-100 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-maroon-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={16} className="text-maroon-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg text-maroon-800 mb-3">{section.title}</h2>
                    <p className="text-maroon-600 text-sm leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 text-sm font-medium mb-1">Placeholder Document</p>
              <p className="text-amber-700 text-xs leading-relaxed">
                These terms of use are a placeholder for development purposes. Final terms should be reviewed
                and approved by the appropriate University of the Philippines legal or administrative office
                before the platform is made publicly available.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-8 border-t border-maroon-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-2.5 h-2.5 rounded-full bg-maroon-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-upgreen-600" />
            <span className="text-xs text-maroon-600 tracking-widest uppercase ml-1">University of the Philippines</span>
          </div>
          <Link
            href="/login"
            className="text-xs text-maroon-400 hover:text-maroon-700 transition-colors"
          >
            Return to SPARK →
          </Link>
        </div>
      </div>
    </div>
  );
}
