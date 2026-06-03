export const adCopyPrompt = (productName: string, emotionalTriggers: string[]) => `
Generate high-converting Facebook Ad copy for this dropshipping product:
Product Name: ${productName}
Emotional Triggers: ${emotionalTriggers.join(", ")}

Return a JSON object matching this schema:
{
  "hooks": ["string (at least 3 variations)"],
  "headlines": ["string (at least 3 variations)"],
  "primaryTexts": ["string (at least 2 variations)"],
  "ctaVariations": ["string (at least 2 variations)"]
}
`;
