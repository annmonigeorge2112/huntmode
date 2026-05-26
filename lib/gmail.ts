import { gmail_v1, google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`
);

if (process.env.GMAIL_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });
}

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
}

export interface EmailThread {
  id: string;
  messages: EmailMessage[];
  snippet: string;
}

export async function createGmailDraft(
  to: string,
  subject: string,
  body: string
): Promise<string> {
  try {
    const rawEmail = [
      `From: me`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      "",
      body,
    ].join("\n");

    const encodedMessage = Buffer.from(rawEmail)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: encodedMessage,
        },
      },
    });

    const draftId = response.data.id;
    return `https://mail.google.com/mail/u/0/#drafts/${draftId}`;
  } catch (error) {
    console.error("Failed to create Gmail draft:", error);
    throw error;
  }
}

export async function checkReplies(): Promise<EmailMessage[]> {
  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread label:inbox",
      maxResults: 10,
    });

    const messages: EmailMessage[] = [];
    const messageIds = response.data.messages || [];

    for (const msg of messageIds) {
      if (msg.id) {
        const fullMsg = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
        });

        const headers = fullMsg.data.payload?.headers || [];
        const from = headers.find((h) => h.name === "From")?.value || "";
        const emailSubject = headers.find((h) => h.name === "Subject")?.value || "";
        const date = headers.find((h) => h.name === "Date")?.value || "";

        messages.push({
          id: msg.id,
          threadId: fullMsg.data.threadId || "",
          from,
          to: "me",
          subject: emailSubject,
          body: fullMsg.data.snippet || "",
          date,
        });
      }
    }

    return messages;
  } catch (error) {
    console.error("Failed to check Gmail replies:", error);
    return [];
  }
}

export async function getThread(threadId: string): Promise<EmailThread | null> {
  try {
    const response = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
    });

    const messages: EmailMessage[] = [];
    const threadMessages = response.data.messages || [];

    for (const msg of threadMessages) {
      const headers = msg.payload?.headers || [];
      const from = headers.find((h) => h.name === "From")?.value || "";
      const subject = headers.find((h) => h.name === "Subject")?.value || "";
      const date = headers.find((h) => h.name === "Date")?.value || "";

      messages.push({
        id: msg.id || "",
        threadId: response.data.id || "",
        from,
        to: "me",
        subject,
        body: msg.snippet || "",
        date,
      });
    }

    return {
      id: response.data.id || "",
      messages,
      snippet: response.data.snippet || "",
    };
  } catch (error) {
    console.error("Failed to get Gmail thread:", error);
    return null;
  }
}

export async function sendDraft(draftId: string): Promise<void> {
  try {
    await gmail.users.drafts.send({
      userId: "me",
      requestBody: {
        id: draftId,
      },
    });
  } catch (error) {
    console.error("Failed to send draft:", error);
    throw error;
  }
}
