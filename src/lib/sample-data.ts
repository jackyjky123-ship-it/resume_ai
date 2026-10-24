import {
  createResumeId,
  type ResumeDocument,
} from "@/lib/validations/resume";

/**
 * Returns a complete, realistic sample resume document with newly generated IDs.
 * Used for demoing templates, first-time user onboarding, and test assertions.
 */
export function createSampleResumeDocument(): ResumeDocument {
  return {
    version: 1,
    personal: {
      fullName: "Alex Rivera",
      roleApplied: "Principal Cloud Systems Architect",
      email: "alex.rivera@example.com",
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA",
      website: "https://rivera-systems.dev",
      linkedin: "https://linkedin.com/in/alex-rivera-cloud",
      github: "https://github.com/alexrivera",
      telegram: "t.me/alexrivera_dev",
      photoUrl: "",
      gender: "",
      nationality: "American",
      dateOfBirth: "",
      placeOfBirth: "",
      strengths: "Distributed Systems, Zero-Trust Architecture, Kubernetes Control Planes",
    },
    summary:
      "Principal Cloud Systems Architect with 10+ years designing high-throughput distributed systems, zero-trust infrastructure, and Kubernetes multi-cloud control planes across AWS and GCP. Proven track record leading infrastructure reliability engineering teams and achieving 99.995% service uptime at global scale.",
    experience: [
      {
        id: createResumeId(),
        company: "Starlight Cloud Platforms",
        role: "Principal Infrastructure Architect",
        location: "San Francisco, CA",
        startDate: "2022",
        endDate: "Present",
        current: true,
        bullets: [
          {
            id: createResumeId(),
            text: "Architected multi-region Kubernetes control plane managing 4,000+ nodes across 3 cloud providers with sub-second failover.",
          },
          {
            id: createResumeId(),
            text: "Spearheaded zero-trust identity migration across 180 microservices, reducing unauthorized perimeter scan attempts to zero.",
          },
          {
            id: createResumeId(),
            text: "Cut annualized egress infrastructure spend by $1.4M through intelligent edge caching and automated VPC peering policies.",
          },
        ],
      },
      {
        id: createResumeId(),
        company: "Apex Distributed Data",
        role: "Lead Platform Engineer",
        location: "Seattle, WA",
        startDate: "2019",
        endDate: "2022",
        current: false,
        bullets: [
          {
            id: createResumeId(),
            text: "Designed and deployed low-latency event-driven pipeline processing 180,000 events/second using Kafka and Rust microservices.",
          },
          {
            id: createResumeId(),
            text: "Standardized CI/CD GitOps pipelines with ArgoCD and Terraform, decreasing deployment cycle time from 4 days to 15 minutes.",
          },
          {
            id: createResumeId(),
            text: "Mentored 12 junior and mid-level platform engineers across distributed systems design patterns and operational incident management.",
          },
        ],
      },
      {
        id: createResumeId(),
        company: "Nimbus Networks",
        role: "Senior Systems Engineer",
        location: "San Jose, CA",
        startDate: "2016",
        endDate: "2019",
        current: false,
        bullets: [
          {
            id: createResumeId(),
            text: "Maintained mission-critical edge reverse-proxy clusters with Envoy and NGINX handling over 2B daily API queries.",
          },
          {
            id: createResumeId(),
            text: "Automated multi-datacenter disaster recovery simulations, verifying automated failover meets RTO < 3 min and RPO = 0.",
          },
        ],
      },
    ],
    education: [
      {
        id: createResumeId(),
        school: "University of California, Berkeley",
        degree: "Bachelor of Science",
        field: "Computer Science and Electrical Engineering",
        location: "Berkeley, CA",
        startDate: "2012",
        endDate: "2016",
        details: "Graduated with Honors. Focused on Distributed Systems, Computer Networks, and Database Internals.",
      },
    ],
    skills: [
      { id: createResumeId(), name: "Kubernetes & Containers" },
      { id: createResumeId(), name: "Distributed Systems" },
      { id: createResumeId(), name: "Go & Rust" },
      { id: createResumeId(), name: "TypeScript & React" },
      { id: createResumeId(), name: "AWS & GCP Architecture" },
      { id: createResumeId(), name: "Terraform & GitOps" },
      { id: createResumeId(), name: "PostgreSQL & Redis" },
      { id: createResumeId(), name: "OpenTelemetry & Prometheus" },
      { id: createResumeId(), name: "Zero Trust Security" },
    ],
    projects: [
      {
        id: createResumeId(),
        name: "MeshGuard",
        url: "https://github.com/alexrivera/meshguard",
        description: "Open-source service mesh security observability tool for Istio and Linkerd clusters.",
        bullets: [
          {
            id: createResumeId(),
            text: "Achieved 2,800+ GitHub stars and adoption by over 40 technology enterprises.",
          },
          {
            id: createResumeId(),
            text: "Engineered real-time MTLS certificate expiration auditing with eBPF kernel probes.",
          },
        ],
      },
      {
        id: createResumeId(),
        name: "TraceFlow",
        url: "https://traceflow-demo.dev",
        description: "Lightweight trace visualization dashboard built with Next.js, WebGL, and ClickHouse.",
        bullets: [
          {
            id: createResumeId(),
            text: "Visualizes latency bottlenecks across thousands of asynchronous spans in real time.",
          },
        ],
      },
    ],
    certifications: [
      {
        id: createResumeId(),
        name: "AWS Certified Solutions Architect – Professional",
        issuer: "Amazon Web Services",
        issueDate: "2024",
        credentialUrl: "https://aws.amazon.com/verification",
      },
      {
        id: createResumeId(),
        name: "Certified Kubernetes Administrator (CKA)",
        issuer: "Cloud Native Computing Foundation",
        issueDate: "2023",
        credentialUrl: "https://cncf.io/certification/cka",
      },
    ],
    languages: [
      { id: createResumeId(), name: "English", proficiency: "Native / Bilingual" },
      { id: createResumeId(), name: "Spanish", proficiency: "Professional Working" },
      { id: createResumeId(), name: "German", proficiency: "Elementary" },
    ],
    references: [],
  };
}
