// ─────────────────────────────────────────────────────────────
//  Edit this file to update the site. No build step needed —
//  commit + push and GitHub Pages redeploys in ~1 minute.
// ─────────────────────────────────────────────────────────────
window.SITE = {
  name: "Alexander Ong",
  title: "Member of Technical Staff, Performance @ Zyphra",
  location: "Bay Area, CA",
  description:
    "I work on the infrastructure that trains and serves large language models: GPU fleets, " +
    "inference optimization on vLLM and SGLang, Kubernetes, Slurm, and the fault tolerance that " +
    "keeps long training runs alive. Previously at ByteDance/TikTok and Capital Group.",
  links: {
    linkedin: "https://www.linkedin.com/in/alex-ong/",
    github: "https://github.com/adot18",
    email: "ongalex888@gmail.com",
  },

  // Shown under the intro. Edit freely.
  interests: {
    intro: "Beyond runtime optimization, I'm interested in learning more about:",
    items: [
      "Continual learning",
      "Sandboxing",
      "The next layer of inference",
    ],
  },

  experience: [
    {
      company: "Zyphra",
      role: "Member of Technical Staff, Performance",
      dates: "Dec 2025 – Present",
      place: "San Francisco, CA",
      points: [
        "Built a multi-agent harness that automates inference optimization recipes for new open-source models on vLLM and SGLang, from first load to a validated serving config.",
        "Improving the Zyphra Cloud inference stack with llm-d on Kubernetes: per-model deployments, inference-gateway routing, and load-aware EPP scheduling.",
        "Managing 200+ AMD MI300X and 100+ NVIDIA GPU nodes, holding average fleet GPU utilization above 90%.",
        "Building Zookeeper, a cluster and job fault-tolerance system that lifted training stability from 80% to 95% ETTR.",
      ],
    },
    {
      company: "ByteDance / TikTok",
      role: "Software Engineer, Applied Machine Learning",
      dates: "Aug 2024 – Dec 2025",
      place: "San Jose, CA",
      points: [
        "Held GPU online rate above 98% and training failure rate below 5%, beating business SLAs.",
        "Built Malphite, a resource platform to manage and monitor 1000s of H100, A100, and B200 GPU nodes.",
        "Automated software upgrades across 1000s of GPU machines, gated on NCCL and TFLOPS benchmarks.",
      ],
    },
    {
      company: "Capital Group",
      role: "Software Engineer, Platform",
      dates: "Aug 2023 – Aug 2024",
      place: "Irvine, CA",
      points: [
        "Architected and migrated a compliance application from on-prem to AWS, saving $1.5 million.",
        "Designed file pipelines to manage international ETFs, growing ETF revenue.",
      ],
    },
  ],

  education: { school: "San Jose State University", degree: "B.S. Computer Science" },

  // Manual entries (e.g. papers or custom overrides matching a repo URL).
  // Pinned GitHub repositories are automatically synced into pinned-projects.js.
  projects: [
    {
      type: "paper",
      name: "ZAYA1-8B Technical Report",
      blurb: "Co-author. Contributed Zookeeper, training resiliency for the MI300X pretraining run: automated link-flap detection, rekicks, and fault triage.",
      url: "https://arxiv.org/abs/2605.05365",
      tags: ["arXiv 2026", "MI300X", "Pretraining"],
    },
  ],
};
