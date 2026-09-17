/** Last live compile baked for first paint. Refresh replaces this. */
import type { PaperRow } from "../lib/compile.ts";
import type { SourceLog } from "../lib/ingest-log.ts";
import type { HnHit } from "../lib/hn.ts";
import type { TrackerHit } from "../lib/tracker.ts";
import type { WireStory } from "../lib/wire.ts";

export type LastSeed = {
  at: string;
  skim: string[];
  papers: PaperRow[];
  wires: WireStory[];
  metr: WireStory[];
  hn: HnHit[];
  tracker: TrackerHit[];
  ingest: SourceLog[];
};

export const LAST_SEED: LastSeed = {
  "at": "2026-09-17T20:32:30.717Z",
  "skim": [
    "HuggingNews: Raindrop Raises $50 Million Series A For AI Agent Simulation Tools",
    "METR: Update on Security at METR",
    "HuggingNews: Goodfire AI Cuts LLM Monitoring Cost 90% to Block AI Reward Hacking"
  ],
  "papers": [
    {
      "id": "2609.18779",
      "title": "CERA-MoA: Co-Evolving Routing Mechanisms with Continually Learning LLM Agents",
      "up": 4,
      "keep": true,
      "href": "https://arxiv.org/abs/2609.18779"
    },
    {
      "id": "2609.19138",
      "title": "In-Context Robot Learning with VLM Agents",
      "up": 14,
      "keep": true,
      "href": "https://arxiv.org/abs/2609.19138"
    },
    {
      "id": "2609.17708",
      "title": "Confidence Comes from Experience: Experiential Confidence Estimation from Reasoning to Agents",
      "up": 48,
      "keep": true,
      "href": "https://arxiv.org/abs/2609.17708"
    },
    {
      "id": "2609.15938",
      "title": "HypoEvolve: Genetic Algorithms Enable Multi-Agent LLMs to Discover Scientific Hypotheses",
      "up": 25,
      "keep": true,
      "href": "https://arxiv.org/abs/2609.15938"
    },
    {
      "id": "2609.17632",
      "title": "EvolveTrade: Experience-Driven Policy Refinement for Self-Evolving LLM Trading Agents",
      "up": 30,
      "keep": true,
      "href": "https://arxiv.org/abs/2609.17632"
    },
    {
      "id": "2609.19134",
      "title": "ScienceIDE: Turning World's Scientific Codebase into Agent Learnable Environments",
      "up": 69,
      "keep": true,
      "href": "https://arxiv.org/abs/2609.19134"
    }
  ],
  "wires": [
    {
      "id": "https://huggingnews.com/ai/raindrop-raises-50-million-series-a-for-ai-agent-simulation-tools-9c4103c1",
      "title": "Raindrop Raises $50 Million Series A For AI Agent Simulation Tools",
      "summary": "CRV and Lightspeed Venture Partners led a funding round for Raindrop to scale its safety layer designed to catch hallucinations and tool call errors in AI agents. The Series A brought the company's total funding to $50 m",
      "href": "https://huggingnews.com/ai/raindrop-raises-50-million-series-a-for-ai-agent-simulation-tools-9c4103c1",
      "at": "2026-09-17T18:56:59.096Z",
      "keep": true,
      "rank": "rumor",
      "reason": "No METR, Hugging Face, OpenAI, or Anthropic primary. Treat as rumor.",
      "outlet": "HuggingNews"
    },
    {
      "id": "https://huggingnews.com/ai/goodfire-ai-cuts-llm-monitoring-cost-90percent-to-block-ai-reward-hackin-550629ef",
      "title": "Goodfire AI Cuts LLM Monitoring Cost 90% to Block AI Reward Hacking",
      "summary": "Internal signals from within large language models identify \"reward hacking\" in 50% to 96% of rollouts studied by Goodfire AI. The company's new activation monitors detect behaviors such as gaming metrics and avoiding de",
      "href": "https://huggingnews.com/ai/goodfire-ai-cuts-llm-monitoring-cost-90percent-to-block-ai-reward-hackin-550629ef",
      "at": "2026-09-17T18:56:59.096Z",
      "keep": true,
      "rank": "rest",
      "reason": "Anthropic eval texture. Different lab. Not a fourth wave.",
      "outlet": "HuggingNews"
    },
    {
      "id": "https://huggingnews.com/ai/google-launches-gemini-38-flash-agent-harness-with-files-and-credentials-b3f4baaf",
      "title": "Google Launches Gemini 3.8 Flash Agent Harness With Files and Credentials APIs",
      "summary": "The antigravity-preview-09-2026 update introduces a dedicated Linux sandbox and updated toolsets to Google AI Studio and the Interactions API. This version runs on Gemini 3.8 Flash and includes a Files API for moving dat",
      "href": "https://huggingnews.com/ai/google-launches-gemini-38-flash-agent-harness-with-files-and-credentials-b3f4baaf",
      "at": "2026-09-17T18:56:59.096Z",
      "keep": true,
      "rank": "rumor",
      "reason": "No METR, Hugging Face, OpenAI, or Anthropic primary. Treat as rumor.",
      "outlet": "HuggingNews"
    },
    {
      "id": "https://huggingnews.com/ai/zai-agent-boosts-glm-53-flash-throughput-32-times-in-2-week-self-optimiz-51cdf6b9",
      "title": "Zai Agent Boosts GLM-5.3-Flash Throughput 3.2 Times in 2 Week Self Optimization",
      "summary": "An automated infrastructure tool powered by GLM-5.3 optimized the inference stack for its Flash counterpart on domestic accelerators. The agent transitioned the system from an initial run to production readiness in under",
      "href": "https://huggingnews.com/ai/zai-agent-boosts-glm-53-flash-throughput-32-times-in-2-week-self-optimiz-51cdf6b9",
      "at": "2026-09-17T15:11:26.998Z",
      "keep": true,
      "rank": "rumor",
      "reason": "No METR, Hugging Face, OpenAI, or Anthropic primary. Treat as rumor.",
      "outlet": "HuggingNews"
    },
    {
      "id": "https://openai.com/index/model-misalignment-reporting-framework",
      "title": "Our framework for reporting model misalignment",
      "summary": "",
      "href": "https://openai.com/index/model-misalignment-reporting-framework",
      "at": "2026-09-16T17:00:00.000Z",
      "keep": true,
      "rank": "rumor",
      "reason": "No METR, Hugging Face, OpenAI, or Anthropic primary. Treat as rumor.",
      "outlet": "OpenAI"
    },
    {
      "id": "khxvR2fgAeDvG5N2F",
      "title": "Shallow Beliefs: Midtraining does not inoculate against EM from reward hacking",
      "summary": "It would be useful if we had the ability to modify a model’s beliefs. For example, this could facilitate honeypots and better monitoring [1] , help us do better science on current models [2] , and augment certain forms o",
      "href": "https://www.alignmentforum.org/posts/khxvR2fgAeDvG5N2F/shallow-beliefs-midtraining-does-not-inoculate-against-em",
      "at": "2026-09-15T21:50:08.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Does not outrank a confirmed production escape.",
      "outlet": "Alignment Forum"
    },
    {
      "id": "https://huggingface.co/blog/ibm-research/altk-evolve-consistency",
      "title": "Your Agent Aced the Task. Will It Do It Again?",
      "summary": "",
      "href": "https://huggingface.co/blog/ibm-research/altk-evolve-consistency",
      "at": "2026-09-15T16:00:44.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Security lab. Digest ref — not a replacement for the lead.",
      "outlet": "Hugging Face",
      "beat": "security"
    },
    {
      "id": "https://blog.trailofbits.com/2026/09/15/1passwords-ai-patching-benchmark-is-misleading/",
      "title": "1Password's AI patching benchmark is misleading",
      "summary": "<p>1Password’s <a href=\"https://1password.com/blog/why-ai-generated-patches-still-require-human-review\">FLAWED report</a>, published on August 6, 2026, gives defenders a misleading picture of AI patching. Its headline sa",
      "href": "https://blog.trailofbits.com/2026/09/15/1passwords-ai-patching-benchmark-is-misleading/",
      "at": "2026-09-15T11:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Does not outrank a confirmed production escape.",
      "outlet": "Trail of Bits",
      "beat": "security"
    },
    {
      "id": "https://thezvi.substack.com/p/we-must-pace-the-frontier",
      "title": "We Must Pace The Frontier",
      "summary": "",
      "href": "https://thezvi.substack.com/p/we-must-pace-the-frontier",
      "at": "2026-09-14T15:21:57.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Policy or product. It does not change what happened in production.",
      "outlet": "Zvi"
    },
    {
      "id": "YGTWfyZb9oE5EQPu6",
      "title": "Op-Ed: I Worked at Google DeepMind. You Should Listen to the Warnings About AI",
      "summary": "Published in The Guardian . Major AI lab CEOs recently advocated for pacing AI development. They are right to be concerned: the field runs an extremely dangerous race towards superintelligent AI. We can and should demand",
      "href": "https://www.alignmentforum.org/posts/YGTWfyZb9oE5EQPu6/op-ed-i-worked-at-google-deepmind-you-should-listen-to-the",
      "at": "2026-09-14T14:53:57.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Eval-desk writing. Not a rumor — and not a replacement for the lead.",
      "outlet": "Alignment Forum"
    },
    {
      "id": "https://epochai.substack.com/p/the-epoch-brief-september-12-2026",
      "title": "The Epoch Brief - September 12, 2026",
      "summary": "",
      "href": "https://epochai.substack.com/p/the-epoch-brief-september-12-2026",
      "at": "2026-09-12T16:51:21.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Eval-desk writing. Not a rumor — and not a replacement for the lead.",
      "outlet": "Epoch"
    },
    {
      "id": "https://blog.redwoodresearch.org/p/cot-controllability-evals-seem-very",
      "title": "CoT controllability evals seem very under-elicited",
      "summary": "Simple prompt optimizations can improve model capability to control their reasoning",
      "href": "https://blog.redwoodresearch.org/p/cot-controllability-evals-seem-very",
      "at": "2026-09-11T17:12:25.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Eval-desk writing. Not a rumor — and not a replacement for the lead.",
      "outlet": "Redwood"
    },
    {
      "id": "BbP2wCyDGdPWJ7PwP",
      "title": "CoT controllability evals seem very under-elicited",
      "summary": "The CoTControl eval asks reasoning models to follow formatting constraints in their chain-of-thought (e.g. write in all lowercase, avoid a specific word) while solving questions. Models seem to mostly be pretty bad at th",
      "href": "https://www.alignmentforum.org/posts/BbP2wCyDGdPWJ7PwP/cot-controllability-evals-seem-very-under-elicited",
      "at": "2026-09-11T17:12:04.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "A product bake-off that names Astra is not OpenAI product usage and not the swarm.",
      "outlet": "Alignment Forum"
    },
    {
      "id": "https://blog.redwoodresearch.org/p/proposal-for-tracking-the-effects",
      "title": "Proposal for tracking the effects of architecture on monitorability",
      "summary": "Architectures that incorporate opaque recurrence or allow agents to communicate using latents could rapidly make it much harder to monitor chains of thought. We propose that AI companies regularly report verified informa",
      "href": "https://blog.redwoodresearch.org/p/proposal-for-tracking-the-effects",
      "at": "2026-09-10T18:13:53.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Eval-desk writing. Not a rumor — and not a replacement for the lead.",
      "outlet": "Redwood"
    },
    {
      "id": "x8BvtWxtoajBGHS3g",
      "title": "An operationalization of opaque serial depth",
      "summary": "Currently, chain-of-thought (CoT) is a valuable tool for overseeing AI models. However, some architectural shifts could significantly reduce CoT monitorability . We have recently proposed that AI companies should transpa",
      "href": "https://www.alignmentforum.org/posts/x8BvtWxtoajBGHS3g/an-operationalization-of-opaque-serial-depth",
      "at": "2026-09-10T17:26:39.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "A product bake-off that names Astra is not OpenAI product usage and not the swarm.",
      "outlet": "Alignment Forum"
    },
    {
      "id": "https://thezvi.substack.com/p/gpt-6-astra-the-system-card-alignment",
      "title": "GPT-6 Astra: The System Card, Alignment and What Comes Next",
      "summary": "",
      "href": "https://thezvi.substack.com/p/gpt-6-astra-the-system-card-alignment",
      "at": "2026-09-09T13:04:59.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Eval-desk writing. Not a rumor — and not a replacement for the lead.",
      "outlet": "Zvi"
    },
    {
      "id": "https://blog.trailofbits.com/2026/09/09/a-proof-of-fermats-last-theorem-that-fits-the-margin/",
      "title": "A “proof” of Fermat’s Last Theorem that fits the margin",
      "summary": "<p>Fermat famously claimed to have a “truly marvelous proof” of his <a href=\"https://en.wikipedia.org/wiki/Fermat%27s_Last_Theorem\">Last Theorem</a>, but he never wrote it down, insisting the margin of his page was too n",
      "href": "https://blog.trailofbits.com/2026/09/09/a-proof-of-fermats-last-theorem-that-fits-the-margin/",
      "at": "2026-09-09T11:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Capability demo. A Hugging Face mention here is context, not a new production fact.",
      "outlet": "Trail of Bits",
      "beat": "security"
    },
    {
      "id": "https://www.transformernews.ai/p/rogue-ai-incidents-timeline",
      "title": "Everything you need to know about the ‘rogue’ AI incidents",
      "summary": "A spate of AIs breaking out and taking unintended actions raises serious questions about accountability, transparency, and companies’ ability to control their AI systems",
      "href": "https://www.transformernews.ai/p/rogue-ai-incidents-timeline",
      "at": "2026-09-08T13:06:25.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Eval-desk writing. Not a rumor — and not a replacement for the lead.",
      "outlet": "Transformer"
    },
    {
      "id": "https://thezvi.substack.com/p/astra-is-hard-to-monitor",
      "title": "Astra Is Hard to Monitor",
      "summary": "",
      "href": "https://thezvi.substack.com/p/astra-is-hard-to-monitor",
      "at": "2026-09-08T11:25:08.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Eval-desk writing. Not a rumor — and not a replacement for the lead.",
      "outlet": "Zvi"
    },
    {
      "id": "https://jack-clark.net/2026/09/07/import-ai-472-deepminds-cheating-math-agents-populist-ai-policies-and-forethought-theorizes-a-nightwatchman/",
      "title": "Import AI 472: DeepMind’s cheating math agents; populist AI policies; and Forethought theorizes a nightwatchman",
      "summary": "Welcome to Import AI, a newsletter about AI research. Import AI runs on arXiv, cappuccinos, and feedback from readers. If you’d like to support this, please subscribe. Subscribe now Researchers discover another OpenAI ag",
      "href": "https://jack-clark.net/2026/09/07/import-ai-472-deepminds-cheating-math-agents-populist-ai-policies-and-forethought-theorizes-a-nightwatchman/",
      "at": "2026-09-07T12:26:31.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Does not outrank a confirmed production escape.",
      "outlet": "Import AI"
    },
    {
      "id": "https://thezvi.substack.com/p/openai-and-the-wiki-incident",
      "title": "OpenAI and the Wiki Incident",
      "summary": "",
      "href": "https://thezvi.substack.com/p/openai-and-the-wiki-incident",
      "at": "2026-09-06T20:01:31.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Does not outrank a confirmed production escape.",
      "outlet": "Zvi"
    },
    {
      "id": "https://www.transformernews.ai/p/congress-goes-quiet-as-ai-safety-concerns-grow",
      "title": "Congress goes quiet as AI safety concerns mount",
      "summary": "Transformer Weekly: More rogue OpenAI agents, GPT-6 Astra, and Bernie’s superintelligence ban",
      "href": "https://www.transformernews.ai/p/congress-goes-quiet-as-ai-safety-concerns-grow",
      "at": "2026-09-04T16:01:58.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Policy bill. Not a production fact.",
      "outlet": "Transformer"
    },
    {
      "id": "https://www.transformernews.ai/p/openai-gpt-6-astra-might-be-too-powerful-to-understand-or-control",
      "title": "GPT-6 Astra might be too powerful to understand or control",
      "summary": "OpenAI is hailing its new model as “the world’s most intelligent and aligned”, but the details reveal an awareness of being evaluated and an ability to manipulate its visible reasoning",
      "href": "https://www.transformernews.ai/p/openai-gpt-6-astra-might-be-too-powerful-to-understand-or-control",
      "at": "2026-09-04T11:05:49.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Does not outrank a confirmed production escape.",
      "outlet": "Transformer"
    },
    {
      "id": "https://www.transformernews.ai/p/what-is-neuralese-openai-astra-chain-of-thought-recurrent-depth",
      "title": "What’s neuralese and why is everyone so concerned about it?",
      "summary": "OpenAI’s new Astra model is raising concerns about our continued ability to monitor AI’s chain of thought",
      "href": "https://www.transformernews.ai/p/what-is-neuralese-openai-astra-chain-of-thought-recurrent-depth",
      "at": "2026-09-03T10:31:57.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Does not outrank a confirmed production escape.",
      "outlet": "Transformer"
    },
    {
      "id": "https://huggingface.co/blog/grpo-with-trl-ifstruct",
      "title": "Fine-tuning a 350M Model for Better Structured Outputs in 100 GRPO Steps",
      "summary": "",
      "href": "https://huggingface.co/blog/grpo-with-trl-ifstruct",
      "at": "2026-09-03T00:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Security lab. Digest ref — not a replacement for the lead.",
      "outlet": "Hugging Face",
      "beat": "security"
    },
    {
      "id": "https://huggingface.co/blog/funes",
      "title": "Give Your Coding Agents a Memory You Own",
      "summary": "",
      "href": "https://huggingface.co/blog/funes",
      "at": "2026-09-03T00:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Security lab. Digest ref — not a replacement for the lead.",
      "outlet": "Hugging Face",
      "beat": "security"
    },
    {
      "id": "https://huggingface.co/blog/train-to-paint-with-code",
      "title": "Training a coding model to paint watercolours with TRL and OpenEnv",
      "summary": "",
      "href": "https://huggingface.co/blog/train-to-paint-with-code",
      "at": "2026-09-03T00:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Security lab. Digest ref — not a replacement for the lead.",
      "outlet": "Hugging Face",
      "beat": "security"
    },
    {
      "id": "https://jack-clark.net/2026/08/31/import-ai-471-why-hugging-face-worries-me-space-mining-five-eyes-on-ai/",
      "title": "Import AI 471: Why Hugging Face worries me; space mining; FIve Eyes on AI",
      "summary": "Welcome to Import AI, a newsletter about AI research. Import AI runs on arXiv, cappuccinos, and feedback from readers. If you’d like to support this, please subscribe. Subscribe now Import AI reader giveaway! Upcoming ev",
      "href": "https://jack-clark.net/2026/08/31/import-ai-471-why-hugging-face-worries-me-space-mining-five-eyes-on-ai/",
      "at": "2026-08-31T13:31:06.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "Does not outrank a confirmed production escape.",
      "outlet": "Import AI"
    },
    {
      "id": "https://www.aisi.gov.uk/blog/optimal-stopping-spending-evaluation-compute-where-it-counts",
      "title": "Optimal stopping: spending evaluation compute where it counts",
      "summary": "UK AISI primary. Independent of the labs. Not a Hugging Face replacement.",
      "href": "https://www.aisi.gov.uk/blog/optimal-stopping-spending-evaluation-compute-where-it-counts",
      "at": "2026-08-27T00:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "UK AISI primary. Not a rumor.",
      "outlet": "UK AISI",
      "beat": "measurement"
    },
    {
      "id": "https://www.aisi.gov.uk/blog/incident-report-unsanctioned-agent-behaviour-during-cyber-testing",
      "title": "Incident Report: unsanctioned agent behaviour during cyber testing",
      "summary": "UK AISI primary. Independent of the labs. Not a Hugging Face replacement.",
      "href": "https://www.aisi.gov.uk/blog/incident-report-unsanctioned-agent-behaviour-during-cyber-testing",
      "at": "2026-08-04T00:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "UK AISI primary. Not a rumor.",
      "outlet": "UK AISI",
      "beat": "measurement"
    },
    {
      "id": "https://www.aisi.gov.uk/blog/how-our-new-control-red-team-is-stress-testing-frontier-monitors",
      "title": "How our Control Red Team is stress-testing frontier monitors",
      "summary": "UK AISI primary. Independent of the labs. Not a Hugging Face replacement.",
      "href": "https://www.aisi.gov.uk/blog/how-our-new-control-red-team-is-stress-testing-frontier-monitors",
      "at": "2026-07-23T00:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "UK AISI primary. Not a rumor.",
      "outlet": "UK AISI",
      "beat": "measurement"
    },
    {
      "id": "https://www.aisi.gov.uk/blog/preliminary-assessment-of-kimi-k3s-cyber-capabilities",
      "title": "UK AISI / CAISI Preliminary Assessment of Kimi K3's Cyber Capabilities",
      "summary": "UK AISI primary. Independent of the labs. Not a Hugging Face replacement.",
      "href": "https://www.aisi.gov.uk/blog/preliminary-assessment-of-kimi-k3s-cyber-capabilities",
      "at": "2026-07-23T00:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "UK AISI primary. Not a rumor.",
      "outlet": "UK AISI",
      "beat": "measurement"
    },
    {
      "id": "https://www.aisi.gov.uk/blog/international-evaluation-best-practice-and-open-questions-in-ai-measurement",
      "title": "International evaluation best practice and open questions in AI measurement",
      "summary": "UK AISI primary. Independent of the labs. Not a Hugging Face replacement.",
      "href": "https://www.aisi.gov.uk/blog/international-evaluation-best-practice-and-open-questions-in-ai-measurement",
      "at": "2026-07-23T00:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "UK AISI primary. Not a rumor.",
      "outlet": "UK AISI",
      "beat": "measurement"
    },
    {
      "id": "https://www.aisi.gov.uk/blog/cheating-behaviour-in-frontier-model-evaluations",
      "title": "Cheating behaviour in frontier model evaluations",
      "summary": "UK AISI primary. Independent of the labs. Not a Hugging Face replacement.",
      "href": "https://www.aisi.gov.uk/blog/cheating-behaviour-in-frontier-model-evaluations",
      "at": "2026-07-21T00:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "UK AISI primary. Not a rumor.",
      "outlet": "UK AISI",
      "beat": "measurement"
    }
  ],
  "metr": [
    {
      "id": "https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/",
      "title": "Brief independent investigation of agents’ behavior, reasoning and collaboration in the OpenAI / Hugging Face hacking incident",
      "summary": "METR primary on the known escape. Update the lead — do not replace it.",
      "href": "https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/",
      "at": "2026-08-26T07:00:00.000Z",
      "keep": true,
      "rank": "lead-bond",
      "reason": "METR primary on the known escape. Update the lead — do not replace it.",
      "outlet": "METR",
      "beat": "investigation"
    },
    {
      "id": "https://metr.org/blog/2026-08-31-security-update/",
      "title": "Update on Security at METR",
      "summary": "METR was itself attacked. Same agent-attack class, different target. Governance primary — not a lead swap.",
      "href": "https://metr.org/blog/2026-08-31-security-update/",
      "at": "2026-08-31T07:00:00.000Z",
      "keep": true,
      "rank": "companion",
      "reason": "METR was itself attacked. Same agent-attack class, different target. Governance primary — not a lead swap.",
      "outlet": "METR",
      "beat": "security"
    },
    {
      "id": "https://metr.org/notes/2026-08-14-llm-contribution-to-discoveries/",
      "title": "Have We Seen an Acceleration in Discoveries?",
      "summary": "METR primary. Independent evaluator. Not a rumor.",
      "href": "https://metr.org/notes/2026-08-14-llm-contribution-to-discoveries/",
      "at": "2026-08-14T07:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "METR primary. Independent evaluator. Not a rumor.",
      "outlet": "METR",
      "beat": "measurement"
    },
    {
      "id": "https://metr.org/blog/2026-08-14-funding-update/",
      "title": "Funding update",
      "summary": "METR capacity. Lab transfers raise the weight. Not a production fact.",
      "href": "https://metr.org/blog/2026-08-14-funding-update/",
      "at": "2026-08-14T07:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "METR capacity. Lab transfers raise the weight. Not a production fact.",
      "outlet": "METR",
      "beat": "org"
    },
    {
      "id": "https://metr.org/blog/2026-07-28-investigating-ai-propensities-after-incidents/",
      "title": "How independent researchers could investigate AI propensities after misalignment incidents",
      "summary": "METR primary. Independent evaluator. Not a rumor.",
      "href": "https://metr.org/blog/2026-07-28-investigating-ai-propensities-after-incidents/",
      "at": "2026-07-28T07:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "METR primary. Independent evaluator. Not a rumor.",
      "outlet": "METR",
      "beat": "measurement"
    },
    {
      "id": "https://metr.org/notes/2026-07-24-metrics-of-model-ability/",
      "title": "Metrics of Agent Ability",
      "summary": "METR primary. Independent evaluator. Not a rumor.",
      "href": "https://metr.org/notes/2026-07-24-metrics-of-model-ability/",
      "at": "2026-07-24T07:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "METR primary. Independent evaluator. Not a rumor.",
      "outlet": "METR",
      "beat": "measurement"
    },
    {
      "id": "https://metr.org/notes/2026-07-22-economics-of-recursive-self-improvement/",
      "title": "The Economics of Recursive Self-Improvement",
      "summary": "METR primary. Independent evaluator. Not a rumor.",
      "href": "https://metr.org/notes/2026-07-22-economics-of-recursive-self-improvement/",
      "at": "2026-07-22T07:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "METR primary. Independent evaluator. Not a rumor.",
      "outlet": "METR",
      "beat": "measurement"
    },
    {
      "id": "https://metr.org/blog/2026-07-21-expenditure-horizon/",
      "title": "Expenditure Horizon: Measuring Optimization Ability, with an Application to NanoGPT",
      "summary": "METR primary. Independent evaluator. Not a rumor.",
      "href": "https://metr.org/blog/2026-07-21-expenditure-horizon/",
      "at": "2026-07-21T07:00:00.000Z",
      "keep": true,
      "rank": "rest",
      "reason": "METR primary. Independent evaluator. Not a rumor.",
      "outlet": "METR",
      "beat": "measurement"
    }
  ],
  "hn": [
    {
      "id": "49563355",
      "title": "Discovery of a new OpenAI agent message board",
      "href": "https://collusion.wiki/",
      "at": "2026-09-04T11:54:53Z",
      "points": 2301,
      "author": "moultano",
      "comments": 1603,
      "query": "agents"
    },
    {
      "id": "49666735",
      "title": "OpenAI agents carried out an undisclosed attack on RubyGems",
      "href": "https://www.rubyhack.ai/",
      "at": "2026-09-11T23:17:42Z",
      "points": 970,
      "author": "chao-",
      "comments": 611,
      "query": "agents"
    },
    {
      "id": "49619227",
      "title": "I resigned from Anthropic today",
      "href": "https://twitter.com/hilbertspaess/status/2097476196791709843#m",
      "at": "2026-09-09T00:40:40Z",
      "points": 736,
      "author": "yurivish",
      "comments": 1016,
      "query": "Anthropic"
    },
    {
      "id": "49704132",
      "title": "A single firm is behind OpenAI, Anthropic, and Meta hacking scandals",
      "href": "https://www.effort.news/irregular",
      "at": "2026-09-14T21:15:01Z",
      "points": 677,
      "author": "yusufozkan",
      "comments": 248,
      "query": "Anthropic"
    },
    {
      "id": "49615537",
      "title": "Muse – Meta’s personal AI agent",
      "href": "https://ai.meta.com/muse/",
      "at": "2026-09-08T19:25:00Z",
      "points": 659,
      "author": "yks",
      "comments": 739,
      "query": "agents"
    },
    {
      "id": "49678969",
      "title": "Why are AI agents lying, cheating and coordinating?",
      "href": "https://yoshuabengio.org/en/publication/why-are-ai-agents-lying-cheating-and-coordinating",
      "at": "2026-09-13T01:22:31Z",
      "points": 656,
      "author": "jonifico",
      "comments": 691,
      "query": "agents"
    },
    {
      "id": "49473522",
      "title": "Judge rules Trump administration’s blacklisting of Anthropic was illegal",
      "href": "https://www.nytimes.com/2026/08/27/technology/anthropic-government-blacklisting-ruling.html",
      "at": "2026-08-28T02:03:38Z",
      "points": 650,
      "author": "jbegley",
      "comments": 437,
      "query": "Anthropic"
    },
    {
      "id": "49610631",
      "title": "I-have-ADHD: A skill to stop coding agents from burying the answer",
      "href": "https://github.com/ayghri/i-have-adhd",
      "at": "2026-09-08T14:13:26Z",
      "points": 541,
      "author": "domhudson",
      "comments": 372,
      "query": "agents"
    },
    {
      "id": "49700477",
      "title": "Pion, an agent designed to run any company autonomously",
      "href": "https://andonlabs.com/blog/why-we-built-pion",
      "at": "2026-09-14T17:16:06Z",
      "points": 489,
      "author": "lukaspetersson",
      "comments": 610,
      "query": "agents"
    },
    {
      "id": "49649213",
      "title": "OpenAI Agents API",
      "href": "https://developers.openai.com/api/docs/guides/agents-api/overview",
      "at": "2026-09-10T19:43:22Z",
      "points": 347,
      "author": "aquir",
      "comments": 187,
      "query": "agents"
    },
    {
      "id": "49685991",
      "title": "David Sacks: OpenAI and Anthropic Don't Need Regulations to Pace Frontier Models",
      "href": "https://twitter.com/DavidSacks/status/2098973625252708460",
      "at": "2026-09-13T16:52:33Z",
      "points": 330,
      "author": "kolanos",
      "comments": 260,
      "query": "Anthropic"
    },
    {
      "id": "49548952",
      "title": "Nvidia to acquire Hugging Face",
      "href": "https://www.cnbc.com/2026/09/03/nvidia-agrees-to-buy-hugging-face-for-almost-13-billion-ai-expansion.html",
      "at": "2026-09-03T12:10:33Z",
      "points": 329,
      "author": "tosh",
      "comments": 107,
      "query": "Hugging Face"
    }
  ],
  "tracker": [
    {
      "id": "1789674793319-openrouter-models-d0cb4d1b",
      "title": "OpenRouter removed ~typesafe/jev-latest",
      "source": "OpenRouter model catalog",
      "href": "https://openrouter.ai/models",
      "at": "2026-09-17T19:53:05.761Z",
      "models": [],
      "keep": true,
      "official": false,
      "kind": "model-change"
    },
    {
      "id": "1789671636280-openrouter-models-56c7840a",
      "title": "OpenRouter added ~typesafe/jev-latest",
      "source": "OpenRouter model catalog",
      "href": "https://openrouter.ai/models",
      "at": "2026-09-17T19:00:21.093Z",
      "models": [
        "~typesafe/jev-latest"
      ],
      "keep": true,
      "official": false,
      "kind": "model-change"
    },
    {
      "id": "1789669167513-openrouter-models-b544924d",
      "title": "OpenRouter added qwen/qwen3.8-27b:free",
      "source": "OpenRouter model catalog",
      "href": "https://openrouter.ai/models",
      "at": "2026-09-17T18:19:08.097Z",
      "models": [
        "qwen/qwen3.8-27b:free"
      ],
      "keep": true,
      "official": false,
      "kind": "model-change"
    },
    {
      "id": "1789664467543-qwen-model-pricing-docs-47983eec",
      "title": "Alibaba Qwen added qwen3.8-omni-flash",
      "source": "Alibaba Model Studio model catalog",
      "href": "https://help.aliyun.com/en/model-studio/model-pricing",
      "at": "2026-09-17T17:01:05.190Z",
      "models": [
        "qwen3-omni",
        "qwen3.5-omni",
        "qwen3.8-omni-flash",
        "qwen3.8-omni-flash"
      ],
      "keep": true,
      "official": true,
      "kind": "model-change"
    },
    {
      "id": "1789649658838-qwen-model-pricing-docs-42879121",
      "title": "Alibaba Qwen added qwen3.8-livetranslate-flash-realtime",
      "source": "Alibaba Model Studio model catalog",
      "href": "https://help.aliyun.com/en/model-studio/model-pricing",
      "at": "2026-09-17T12:54:16.507Z",
      "models": [
        "qwen3.8-livetranslate-flash-realtime",
        "qwen3.8-livetranslate-flash-realtime"
      ],
      "keep": true,
      "official": true,
      "kind": "model-change"
    },
    {
      "id": "1789614252774-qwen-model-pricing-docs-a864e36c",
      "title": "Alibaba Qwen removed 10 models",
      "source": "Alibaba Model Studio model catalog",
      "href": "https://help.aliyun.com/en/model-studio/model-pricing",
      "at": "2026-09-17T03:04:09.883Z",
      "models": [],
      "keep": true,
      "official": true,
      "kind": "model-change"
    },
    {
      "id": "1789605978338-arena-live-model-roster-267538a1",
      "title": "LM Arena model leak: cynosure",
      "source": "Arena live selectable-model roster",
      "href": "https://arena.ai/",
      "at": "2026-09-17T00:45:48.999Z",
      "models": [
        "cynosure"
      ],
      "keep": true,
      "official": false,
      "kind": "model-change"
    },
    {
      "id": "1789587340680-arena-live-model-roster-5042b752",
      "title": "LM Arena model leak: water18-0910-fc",
      "source": "Arena live selectable-model roster",
      "href": "https://arena.ai/",
      "at": "2026-09-16T19:35:11.414Z",
      "models": [
        "water18-0910-fc"
      ],
      "keep": true,
      "official": false,
      "kind": "model-change"
    },
    {
      "id": "1789586908135-arena-live-model-roster-6ad64475",
      "title": "LM Arena model leak: lychee-21-09",
      "source": "Arena live selectable-model roster",
      "href": "https://arena.ai/",
      "at": "2026-09-16T19:27:55.891Z",
      "models": [
        "lychee-21-09"
      ],
      "keep": true,
      "official": false,
      "kind": "model-change"
    },
    {
      "id": "1789586476381-arena-live-model-roster-d24cbac7",
      "title": "LM Arena model leak: pluto",
      "source": "Arena live selectable-model roster",
      "href": "https://arena.ai/",
      "at": "2026-09-16T19:20:38.417Z",
      "models": [
        "pluto"
      ],
      "keep": true,
      "official": false,
      "kind": "model-change"
    },
    {
      "id": "1789583145420-arena-live-model-roster-9c115f1b",
      "title": "LM Arena model leak: lychee-21-38",
      "source": "Arena live selectable-model roster",
      "href": "https://arena.ai/",
      "at": "2026-09-16T18:25:11.716Z",
      "models": [
        "lychee-21-38"
      ],
      "keep": true,
      "official": false,
      "kind": "model-change"
    },
    {
      "id": "1789579384553-arena-live-model-roster-d5650485",
      "title": "LM Arena model leak: kimi-k3-official-max",
      "source": "Arena live selectable-model roster",
      "href": "https://arena.ai/",
      "at": "2026-09-16T17:22:35.708Z",
      "models": [
        "kimi-k3-official-max"
      ],
      "keep": true,
      "official": false,
      "kind": "model-change"
    }
  ],
  "ingest": [
    {
      "id": "metr",
      "label": "METR",
      "live": true,
      "ok": true,
      "count": 8,
      "ms": 523,
      "at": "2026-08-26T07:00:00.000Z",
      "note": "8 English · 1 security · translations dropped · AISI 6 · governance primary"
    },
    {
      "id": "wire",
      "label": "Wire",
      "live": true,
      "ok": true,
      "count": 28,
      "ms": 5003,
      "at": "2026-09-17T18:56:59.096Z",
      "note": "28 kept of 33 · HuggingNews · OpenAI · Alignment Forum · Hugging Face · Trail of Bits · Zvi · Epoch · Redwood · Transformer · Import AI · ranked, not a lab primary"
    },
    {
      "id": "hf",
      "label": "Papers",
      "live": true,
      "ok": true,
      "count": 24,
      "ms": 112,
      "at": "2026-09-17T20:32:25.713Z",
      "note": "6 kept · keep is not upvote"
    },
    {
      "id": "tracker",
      "label": "Tracker",
      "live": true,
      "ok": true,
      "count": 12,
      "ms": 627,
      "at": "2026-09-17T19:53:05.761Z",
      "note": "12 model/docs changes · 68 leaderboard ticks dropped"
    },
    {
      "id": "hn",
      "label": "HN",
      "live": true,
      "ok": true,
      "count": 12,
      "ms": 525,
      "at": "2026-09-04T11:54:53Z",
      "note": "12 stories · last 21 days · Anthropic · Hugging Face · agents · Pulse only · never the briefing"
    },
    {
      "id": "x",
      "label": "X",
      "live": false,
      "ok": true,
      "count": 16,
      "ms": 0,
      "at": "2026-09-16T02:20:00Z",
      "note": "Curran-class snapshot · ranked on compile · no paid firehose"
    },
    {
      "id": "mail",
      "label": "Inbox",
      "live": false,
      "ok": true,
      "count": 12,
      "ms": 0,
      "at": "2026-09-16T01:10:00Z",
      "note": "Newsletter snapshot · ranked on compile"
    },
    {
      "id": "bookmarks",
      "label": "Bookmarks",
      "live": false,
      "ok": true,
      "count": 8,
      "ms": 0,
      "at": "2026-09-13T06:30:00Z",
      "note": "Never the lead"
    }
  ]
};
