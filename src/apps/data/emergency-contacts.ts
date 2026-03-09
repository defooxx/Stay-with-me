export type EmergencyContact = {
  label: string;
  text: string;
  link: string;
  linkLabel: string;
};

const getDirectoryLink = (countryName: string) =>
  `https://findahelpline.com/?country=${encodeURIComponent(countryName)}`;

const getFallbackContacts = (countryName: string): EmergencyContact[] => [
  {
    label: "Country-Based Help Directory",
    text: `Mental health helplines for ${countryName} at`,
    link: getDirectoryLink(countryName),
    linkLabel: "findahelpline.com",
  },
  {
    label: "Local Emergency Services",
    text: `Use your local emergency number in ${countryName} if immediate danger is present.`,
    link: getDirectoryLink(countryName),
    linkLabel: "Find emergency contacts",
  },
];

export const getEmergencyContactsByCountry = (
  countryCode: string,
  countryName: string
): EmergencyContact[] => {
  const code = (countryCode || "").toUpperCase();
  const directoryLink = getDirectoryLink(countryName);

  if (code === "US") {
    return [
      {
        label: "Suicide & Crisis Lifeline (US)",
        text: "Call or text",
        link: "tel:988",
        linkLabel: "988",
      },
      {
        label: "Crisis Text Line",
        text: 'Text "HELLO" to',
        link: "sms:741741",
        linkLabel: "741741",
      },
      {
        label: "Country-Based Help Directory",
        text: `${countryName} options at`,
        link: directoryLink,
        linkLabel: "findahelpline.com",
      },
    ];
  }

  if (code === "CA") {
    return [
      {
        label: "Suicide Crisis Helpline (Canada)",
        text: "Call or text",
        link: "tel:988",
        linkLabel: "988",
      },
      {
        label: "Country-Based Help Directory",
        text: `${countryName} options at`,
        link: directoryLink,
        linkLabel: "findahelpline.com",
      },
    ];
  }

  if (code === "GB") {
    return [
      {
        label: "Samaritans (UK & ROI)",
        text: "Call",
        link: "tel:116123",
        linkLabel: "116 123",
      },
      {
        label: "Country-Based Help Directory",
        text: `${countryName} options at`,
        link: directoryLink,
        linkLabel: "findahelpline.com",
      },
    ];
  }

  if (code === "AU") {
    return [
      {
        label: "Lifeline Australia",
        text: "Call",
        link: "tel:131114",
        linkLabel: "13 11 14",
      },
      {
        label: "Emergency Services",
        text: "Call",
        link: "tel:000",
        linkLabel: "000",
      },
      {
        label: "Country-Based Help Directory",
        text: `${countryName} options at`,
        link: directoryLink,
        linkLabel: "findahelpline.com",
      },
    ];
  }

  if (code === "IN") {
    return [
      {
        label: "Tele-MANAS (India)",
        text: "Call",
        link: "tel:14416",
        linkLabel: "14416",
      },
      {
        label: "Country-Based Help Directory",
        text: `${countryName} options at`,
        link: directoryLink,
        linkLabel: "findahelpline.com",
      },
    ];
  }

  if (code === "NP") {
    return [
      {
        label: "Country-Based Help Directory",
        text: `Mental health helplines for ${countryName} at`,
        link: directoryLink,
        linkLabel: "findahelpline.com",
      },
      {
        label: "Local Emergency Services (Nepal)",
        text: "Police emergency",
        link: "tel:100",
        linkLabel: "100",
      },
      {
        label: "Local Emergency Services",
        text: "Other emergency contacts at",
        link: directoryLink,
        linkLabel: "Find emergency contacts",
      },
    ];
  }

  return getFallbackContacts(countryName);
};
