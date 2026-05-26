import cheerio from "cheerio";
import { scoreJob } from "./claude";
import { searchJobListings } from "./gemini";
import { supabase, Job } from "./supabase";

const TARGET_COMPANIES = [
  // Singapore
  "ST Engineering",
  "Micron Technology Singapore",
  "NXP Semiconductors Singapore",
  "Infineon Technologies Singapore",
  "Broadcom Singapore",
  "Marvell Singapore",
  "Texas Instruments Singapore",
  "Renesas Singapore",
  "Continental Singapore",
  "Bosch Singapore",
  "Panasonic Singapore",
  "Murata Singapore",
  // Malaysia
  "Intel Malaysia",
  "Motorola Solutions Malaysia",
  "Keysight Malaysia",
  "Osram Malaysia",
  "Vishay Malaysia",
  "Jabil Malaysia",
  // Hong Kong
  "ASM Pacific Technology",
  "NXP HK",
  "Sensata HK",
  // Bangalore
  "Bosch Bangalore",
  "Continental Automotive India",
  "Robert Bosch Engineering",
  "Qualcomm Bangalore",
  "Texas Instruments Bangalore",
  "NXP India",
  "KPIT Technologies",
  "Tata Elxsi",
  "L&T Technology Services",
  "Wipro Embedded",
  "HCLTech Engineering",
  "Infosys ERS",
  // Chennai
  "Ford Innovation Chennai",
  "Hyundai Engineering Chennai",
  "Trimble Chennai",
  "Renault Nissan Technology Chennai",
  "HARMAN Chennai",
  // Kochi
  "UST Global",
  "IBS Software",
  "Wipro Kochi",
  "Infosys Kochi",
];

const GEOGRAPHY_MAP: Record<string, string> = {
  singapore: "singapore",
  sg: "singapore",
  malaysia: "malaysia",
  my: "malaysia",
  "hong kong": "hong_kong",
  hk: "hong_kong",
  bangalore: "bangalore",
  blr: "bangalore",
  bengaluru: "bangalore",
  chennai: "chennai",
  madras: "chennai",
  kochi: "kochi",
  cochin: "kochi",
  india: "bangalore", // default
};

function parseGeography(locationStr: string): string | undefined {
  const lower = locationStr.toLowerCase();
  for (const [key, value] of Object.entries(GEOGRAPHY_MAP)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  return undefined;
}

export async function scrapeJobs(): Promise<Job[]> {
  const jobs: Job[] = [];

  for (const company of TARGET_COMPANIES.slice(0, 5)) {
    // Limit to first 5 for demo
    try {
      const searchResults = await searchJobListings(company, "");
      // Parse results and extract job listings
      // This is simplified; in production, extract from Gemini results

      if (searchResults) {
        // Example structure - actual parsing depends on Gemini response format
        const exampleJob: Job = {
          title: `Embedded Systems Intern at ${company}`,
          company,
          description: `Internship in embedded systems and firmware development at ${company}`,
          geography: "singapore",
          source: "gemini_search",
          status: "discovered",
        };

        const scored = await scoreJob(exampleJob);
        exampleJob.match_score = scored.score;
        exampleJob.match_reasons = scored.reasons;
        exampleJob.is_hot = scored.is_hot;

        jobs.push(exampleJob);
      }
    } catch (error) {
      console.error(`Error scraping jobs for ${company}:`, error);
    }
  }

  // Upsert to Supabase
  if (jobs.length > 0) {
    const { error } = await supabase.from("jobs").upsert(jobs, {
      onConflict: "title,company,location",
    });

    if (error) {
      console.error("Error upserting jobs:", error);
    }
  }

  return jobs;
}

export async function getTodaysHRs(limit: number = 5) {
  const { data, error } = await supabase
    .from("hr_contacts")
    .select("*")
    .is("contacted_at", null)
    .order("match_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching today's HRs:", error);
    return [];
  }

  return data || [];
}

export async function getTopJobs(minScore: number = 75, limit: number = 3) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "discovered")
    .gte("match_score", minScore)
    .order("match_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching top jobs:", error);
    return [];
  }

  return data || [];
}
