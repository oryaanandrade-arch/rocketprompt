import fs from 'fs';

const filePath = 'd:/FooguetãodaNasa/project-architect-main/project-architect-main/src/data/promptTemplates.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const imageMap = {
  "marketing-landing": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  "marketing-email": "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&q=80",
  "sales-crm": "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80",
  "sales-dashboard": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  "copy-vsl": "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&q=80",
  "copy-headlines": "https://images.unsplash.com/photo-1504265110150-5d6b412499d6?w=800&q=80",
  "saas-subscription": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
  "saas-multitenancy": "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=800&q=80",
  "automation-workflow": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  "automation-scheduling": "https://images.unsplash.com/photo-1506784951206-8854ef24cbaf?w=800&q=80",
  "ai-chatbot": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
  "ai-content": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  "code-api": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  "code-components": "https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800&q=80",
  "design-dashboard": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80",
  "design-mobile": "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80"
};

for (const [id, url] of Object.entries(imageMap)) {
  const regex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?tags:\\s*\\[.*?\\])`, 'g');
  code = code.replace(regex, `$1,\n    imageUrl: "${url}"`);
}

fs.writeFileSync(filePath, code);
console.log("Images added!");
