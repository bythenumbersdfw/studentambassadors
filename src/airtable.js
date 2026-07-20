const BASE_URL = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}`;

function authHeaders() {
  return {
    Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function post(table, fields) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(table)}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable [${table}] ${res.status}: ${text}`);
  }
  return res.json();
}

const TASK_TO_ACTIVITY_TYPE = {
  scan:      'Shared QR code — respondent reached qualifying questions — 5 pts',
  sit:       'Brought someone to the project table — 10 pts',
  started:   'Connection wants to participate — submitted contact info — 15 pts',
  link:      'Shared the follow-up link — logged their name — 12 pts',
  share:     'Shared the project on social media — 8 pts',
  recruited: 'Brought in another student ambassador — 15 pts',
  mvr:       'MVC nomination — student submitted — 20 pts',
};

const SOURCE_TO_AIRTABLE = {
  self:    'Manual',
  founder: 'Founder Awarded',
};

export async function submitAmbassadorSignup({ name, university, org, sponsorName, sponsorEmail, showOnLeaderboard }) {
  const sponsor = await post('Faculty Sponsors', {
    'Full Name': sponsorName,
    'Email': sponsorEmail,
    'University': university,
  });

  const amb = await post('Student Ambassadors', {
    'Name': name,
    'University': university,
    'Organization': org,
    'Leaderboard Visibility': showOnLeaderboard ? 'Full name' : 'First name only',
    'Approval Status': 'Pending',
    'Points Total': 0,
    'Signup Timestamp': new Date().toISOString().split('T')[0],
    'Faculty Sponsor': [sponsor.id],
  });

  return amb.id;
}

export async function submitActivity({ ambassadorAirtableId, taskId, respondentName, note, source, points }) {
  const fields = {
    'Points Awarded': points,
    'Note': note || '',
    'Source': SOURCE_TO_AIRTABLE[source] || 'Manual',
    'Timestamp': new Date().toISOString().split('T')[0],
  };

  const activityType = TASK_TO_ACTIVITY_TYPE[taskId];
  if (activityType) fields['Activity Type'] = activityType;
  if (respondentName) fields['Respondent Name'] = respondentName;
  if (ambassadorAirtableId) fields['Student Name'] = [ambassadorAirtableId];

  return post('Conference Activities', fields);
}

export async function submitRespondentContact({ name, email, phone, ambassadorAirtableId, formType }) {
  const fields = {
    'Full Name': name || '',
    'Email': email || '',
    'Phone': phone || '',
    'Form Type': formType,
    'Timestamp': new Date().toISOString().split('T')[0],
  };
  if (ambassadorAirtableId) fields['Associated Ambassador'] = [ambassadorAirtableId];

  return post('Respondent Contacts', fields);
}
