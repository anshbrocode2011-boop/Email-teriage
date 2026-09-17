/**
 * Helper to interact with the Gmail REST API using the user's OAuth access token.
 * Strictly read-only operations (gmail.readonly scope).
 */

export interface GmailRawMessage {
  id: string;
  threadId: string;
  snippet?: string;
  sender: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  bodySnippet: string;
}

function parseHeaders(headers: { name: string; value: string }[]) {
  let subject = '(No Subject)';
  let from = 'Unknown Sender';
  let date = '';

  for (const h of headers) {
    const name = h.name.toLowerCase();
    if (name === 'subject') subject = h.value;
    if (name === 'from') from = h.value;
    if (name === 'date') date = h.value;
  }

  // Parse "Name <email@domain.com>" or just "email@domain.com"
  let senderName = from;
  let senderEmail = from;
  const match = from.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    senderName = match[1].replace(/["']/g, '').trim() || match[2];
    senderEmail = match[2].trim();
  }

  return { subject, from, senderName, senderEmail, date };
}

function decodeBase64Url(data: string): string {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    // decode utf-8 properly
    const bytes = Uint8Array.from(binary, (m) => m.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    return '';
  }
}

function extractBody(payload: any): string {
  if (!payload) return '';

  if (payload.parts && payload.parts.length > 0) {
    // Look for text/plain first
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    // Next look for text/html
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = decodeBase64Url(part.body.data);
        // Strip HTML tags for clean plain text body snippet
        return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }
    // Recursive check for multipart
    for (const part of payload.parts) {
      if (part.parts) {
        const body = extractBody(part);
        if (body) return body;
      }
    }
  }

  if (payload.body?.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/html') {
      return decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return decoded;
  }

  return '';
}

/**
 * Fetches up to 50 unread messages from the primary/inbox
 */
export async function fetchUnreadGmailMessages(
  accessToken: string,
  maxResults = 50,
  onProgress?: (current: number, total: number) => void
): Promise<GmailRawMessage[]> {
  const query = encodeURIComponent('is:unread in:inbox');
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=${maxResults}`;

  const listRes = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!listRes.ok) {
    const errText = await listRes.text();
    if (listRes.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    throw new Error(`Gmail API error (${listRes.status}): ${errText}`);
  }

  const listData = await listRes.json();
  const messagesList: { id: string; threadId: string }[] = listData.messages || [];

  if (messagesList.length === 0) {
    return [];
  }

  const total = messagesList.length;
  const detailedMessages: GmailRawMessage[] = [];

  // Batch fetch in chunks of 5 concurrently to avoid rate limits while remaining fast
  const chunkSize = 5;
  for (let i = 0; i < messagesList.length; i += chunkSize) {
    const chunk = messagesList.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(async (msg) => {
        try {
          const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
          const detailRes = await fetch(detailUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          });
          if (!detailRes.ok) return null;
          const data = await detailRes.json();
          const { subject, senderName, senderEmail, date } = parseHeaders(data.payload?.headers || []);
          const rawBody = extractBody(data.payload) || data.snippet || '';
          // Cap text to first 1200 characters to keep payload lightweight and fast
          const bodySnippet = rawBody.slice(0, 1200).trim();

          return {
            id: data.id,
            threadId: data.threadId,
            snippet: data.snippet || '',
            sender: `${senderName} <${senderEmail}>`,
            senderName,
            senderEmail,
            subject,
            date,
            bodySnippet,
          } as GmailRawMessage;
        } catch (err) {
          console.warn(`Failed to fetch message details for ${msg.id}:`, err);
          return null;
        }
      })
    );

    chunkResults.forEach((res) => {
      if (res) detailedMessages.push(res);
    });

    if (onProgress) {
      onProgress(Math.min(i + chunkSize, total), total);
    }
  }

  return detailedMessages;
}
