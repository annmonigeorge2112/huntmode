import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ANN_PROFILE = `
Candidate: Ann Moni George
Degree: B.Tech ECE, FISAT Kerala (2023–2027), CGPA 6.68/10
Key strengths:
- STM32F407G firmware, BLDC motor control, GPIO, real-time systems
- DRDO/CVRDE internships (defence-grade embedded development)
- ESP32, LoRaWAN, RFID, UART, biometric systems
- Published researcher: biometric authentication (national conference 2025)
- MATLAB/Simulink, PWM, FPGA/Verilog, PCB design
- Python, Embedded C, STM32CubeIDE, Keil uVision, Xilinx Vivado
- IEEE SPS Content Lead, team leadership
- Materials science minor (semiconductor relevance)
Note: GPA is 6.68/10 — compensate by emphasizing DRDO experience, research publication, and hands-on project depth
Target: embedded, IoT, automotive, firmware, VLSI, semiconductor roles
Target locations: Singapore, Malaysia, Hong Kong, Chennai, Bangalore, Kochi
`;

export interface JobScore {
  score: number;
  reasons: string[];
  is_hot: boolean;
}

export async function scoreJob(job: {
  title: string;
  company: string;
  location?: string;
  description?: string;
}): Promise<JobScore> {
  const prompt = `Score this internship for Ann (0-100). Return ONLY valid JSON (no markdown, no code fence): { "score": number, "reasons": string[], "is_hot": boolean }
      
Ann's profile: ${ANN_PROFILE}

Job:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || "Not specified"}
Description: ${job.description || "No description provided"}

Score based on: skill match, location preference, domain relevance, company prestige in Ann's target field. Be aggressive — any embedded/IoT/automotive/semiconductor/firmware/VLSI role is a strong match.`;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    return { score: 50, reasons: ["Unable to parse score"], is_hot: false };
  }
}

export async function generateOutreachEmail(
  hr: { name: string; title?: string; company: string; location?: string },
  job?: { title: string }
): Promise<{ subject: string; body: string }> {
  const systemPrompt = `You are writing cold outreach emails on behalf of Ann Moni George, a driven ECE student. 
Ann has low GPA (6.68) but EXCEPTIONAL practical experience at DRDO (India's premier defence research lab) and a published research paper. 
Your emails must: (1) lead with impact not GPA, (2) be concise under 150 words, (3) have a punchy subject line, (4) feel human not AI-generated, (5) include a specific ask, (6) end with warmth.
Never mention GPA. Always mention DRDO or CVRDE. Always mention the publication if relevant.
Adapt tone: Singapore/HK = professional+warm. Bangalore/Chennai = direct. Malaysia = conversational.`;

  const userPrompt = `Write a cold outreach email to:
Name: ${hr.name}
Title: ${hr.title || "Not specified"}
Company: ${hr.company}
Location: ${hr.location || "Not specified"}
${job ? `Specific role: ${job.title}` : "General internship inquiry"}

Ann's strongest hooks for this company: Pick from [DRDO firmware experience, national research publication, IEEE leadership, LoRaWAN disaster resilience project, biometric authentication research, BLDC motor control]

Return ONLY valid JSON (no markdown): { "subject": string, "body": string }`;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 800,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    return {
      subject: `Internship inquiry from Ann Moni George, ECE student at FISAT`,
      body: `Dear ${hr.name},\n\nI'm an ECE student with DRDO embedded systems experience and a published research paper in biometric authentication. I'm interested in opportunities at ${hr.company}.\n\nWould love to connect!\n\nBest regards,\nAnn Moni George`,
    };
  }
}

export async function refineEmail(
  originalEmail: string,
  instruction: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `Refine this email with the following instruction: "${instruction}"\n\nOriginal email:\n${originalEmail}\n\nReturn ONLY the refined email body, nothing else.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : originalEmail;
}
