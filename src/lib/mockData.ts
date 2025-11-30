export type Location = {
  city: string;
  country: string;
  lat: number;
  lng: number;
};

export type SkillTag =
  | "Construction"
  | "Plumbing"
  | "Electrical"
  | "Logistics"
  | "Hospitality"
  | "Catering"
  | "Manufacturing";

export type Worker = {
  id: string;
  name: string;
  headline: string;
  experience: number;
  availability: "Immediate" | "2 weeks" | "1 month";
  hourlyRate: number;
  location: Location;
  rating: number;
  skills: SkillTag[];
  bio: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  budget: string;
  location: Location;
  requiredSkills: SkillTag[];
  description: string;
};

export type Recommendation = {
  id: string;
  worker: Worker;
  matchScore: number;
  driver: string;
};

const workers: Worker[] = [
  {
    id: "wkr-01",
    name: "Amina Yusuf",
    headline: "Solar installation specialist",
    experience: 6,
    availability: "Immediate",
    hourlyRate: 45,
    location: { city: "Nairobi", country: "Kenya", lat: -1.2864, lng: 36.8172 },
    rating: 4.9,
    skills: ["Electrical", "Construction"],
    bio: "Installer focused on micro-grid deployments with rapid setup KPIs.",
  },
  {
    id: "wkr-02",
    name: "Kwame Boateng",
    headline: "Heavy machinery operator",
    experience: 9,
    availability: "2 weeks",
    hourlyRate: 38,
    location: { city: "Accra", country: "Ghana", lat: 5.6037, lng: -0.187 },
    rating: 4.7,
    skills: ["Construction", "Logistics"],
    bio: "Certified operator for CAT, Komatsu fleets with safety-first mindset.",
  },
  {
    id: "wkr-03",
    name: "Lindiwe Ndlovu",
    headline: "Hospitality lead supervisor",
    experience: 8,
    availability: "Immediate",
    hourlyRate: 30,
    location: { city: "Johannesburg", country: "South Africa", lat: -26.2041, lng: 28.0473 },
    rating: 4.8,
    skills: ["Hospitality", "Catering"],
    bio: "Delivers premium guest experiences, multilingual and service design savvy.",
  },
  {
    id: "wkr-04",
    name: "Moses Okello",
    headline: "Industrial electrician",
    experience: 11,
    availability: "1 month",
    hourlyRate: 50,
    location: { city: "Kampala", country: "Uganda", lat: 0.3476, lng: 32.5825 },
    rating: 4.6,
    skills: ["Electrical", "Manufacturing"],
    bio: "Handles factory-line rewiring, PLC upgrades, and preventative maintenance.",
  },
  {
    id: "wkr-05",
    name: "Fatima Diallo",
    headline: "Cold-chain logistics coordinator",
    experience: 7,
    availability: "Immediate",
    hourlyRate: 42,
    location: { city: "Dakar", country: "Senegal", lat: 14.7167, lng: -17.4677 },
    rating: 4.85,
    skills: ["Logistics", "Manufacturing"],
    bio: "Optimizes perishable routes with real-time telemetry and vendor management.",
  },
];

const jobs: Job[] = [
  {
    id: "job-01",
    title: "Mini-grid rollout technician",
    company: "SunPulse Energy",
    budget: "$12k / project",
    location: { city: "Marsabit", country: "Kenya", lat: 2.3342, lng: 37.9893 },
    requiredSkills: ["Electrical", "Construction"],
    description: "Deploy modular solar kits across northern Kenya with rapid QA cycles.",
  },
  {
    id: "job-02",
    title: "Hospitality launch crew",
    company: "Origin Retreats",
    budget: "$8k / month",
    location: { city: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
    requiredSkills: ["Hospitality", "Catering"],
    description: "Lead service blueprinting for a boutique eco-lodge experience.",
  },
  {
    id: "job-03",
    title: "Factory retro-fit electrician",
    company: "MonoWorks Manufacturing",
    budget: "$55/hr",
    location: { city: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792 },
    requiredSkills: ["Electrical", "Manufacturing"],
    description: "Support PLC migration and safety compliance for automated lines.",
  },
];

export function getWorkers(): Worker[] {
  return workers;
}

export function getWorkerById(id: string): Worker | undefined {
  return workers.find((worker) => worker.id === id);
}

export function searchWorkers(skill?: SkillTag, city?: string): Worker[] {
  return workers.filter((worker) => {
    const matchesSkill = skill ? worker.skills.includes(skill) : true;
    const matchesCity = city
      ? worker.location.city.toLowerCase().includes(city.toLowerCase())
      : true;
    return matchesSkill && matchesCity;
  });
}

export function getJobs(): Job[] {
  return jobs;
}

export function getRecommendations(): Recommendation[] {
  return workers.slice(0, 3).map((worker, index) => ({
    id: `rec-${index + 1}`,
    worker,
    matchScore: 90 - index * 5,
    driver:
      index === 0
        ? "Skill proximity + verified completion rate"
        : index === 1
          ? "Within 20km radius & high reliability score"
          : "Top percentile service reviews",
  }));
}

export function createJobPosting(newJob: Omit<Job, "id">): Job {
  const job: Job = { ...newJob, id: `job-${jobs.length + 1}` };
  jobs.push(job);
  return job;
}


