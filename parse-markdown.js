const fs = require('fs');

const markdown = fs.readFileSync('attached_assets/business-ownership-blueprint_1772573724878.md', 'utf8');

// A very simplistic extraction of the content section since we have the full markdown file available
const content = { axes: {}, archetypes: {} };

const axes = ['DEAL INSTINCT', 'OPERATOR DEPTH', 'CAPITAL READINESS', 'RISK TOLERANCE', 'STRATEGIC VISION'];
const axesKeys = ['DI', 'OD', 'CR', 'RT', 'SV'];

// Extract axis variations
axes.forEach((axis, index) => {
  const key = axesKeys[index];
  content.axes[key] = { LOW: [], MEDIUM: [], HIGH: [] };
  
  const sectionStart = markdown.indexOf(`### 7.${index + 1} ${axis}`);
  let sectionEnd = markdown.indexOf(`### 7.${index + 2}`);
  if (sectionEnd === -1) sectionEnd = markdown.indexOf('## SECTION 8');
  
  const sectionText = markdown.slice(sectionStart, sectionEnd);
  
  ['LOW', 'MEDIUM', 'HIGH'].forEach(level => {
    const levelStart = sectionText.indexOf(`**${level}`);
    if (levelStart === -1) return;
    
    let levelEnd = sectionText.indexOf('**LOW', levelStart + 1);
    if (levelEnd === -1) levelEnd = sectionText.indexOf('**MEDIUM', levelStart + 1);
    if (levelEnd === -1) levelEnd = sectionText.indexOf('**HIGH', levelStart + 1);
    if (levelEnd === -1) levelEnd = sectionText.length;
    
    const levelText = sectionText.slice(levelStart, levelEnd);
    const variations = levelText.split('*Variation').slice(1);
    
    variations.forEach(v => {
      const parts = v.split('\n');
      const text = parts.slice(1).join('\n').trim();
      if(text) content.axes[key][level].push(text.replace(/\\n/g, ''));
    });
  });
});

// Extract archetype summaries
const archetypes = ['THE ACQUIRER', 'THE OPERATOR', 'THE BUILDER', 'THE ARCHITECT'];
const archetypeKeys = ['Acquirer', 'Operator', 'Builder', 'Architect'];

archetypes.forEach((archetype, index) => {
  const key = archetypeKeys[index];
  content.archetypes[key] = [];
  
  const sectionStart = markdown.indexOf(`### ${archetype}`);
  let sectionEnd = markdown.indexOf(`### ${archetypes[index + 1] || 'SECTION 9'}`);
  if (sectionEnd === -1) sectionEnd = markdown.indexOf('## SECTION 9');
  
  const sectionText = markdown.slice(sectionStart, sectionEnd);
  
  const variations = sectionText.split('**Summary Variation').slice(1);
  
  variations.forEach(v => {
      // Parse out the sections
      const oppMatch = v.match(/\*\*Biggest Opportunity:\*\* (.*?)(?=\n\n\*\*|$)/s);
      const mistMatch = v.match(/\*\*Most Common Mistake:\*\* (.*?)(?=\n\n\*\*|$)/s);
      const focusMatch = v.match(/\*\*Your 90-Day Focus:\*\* (.*?)(?=\n\n\*\*|$)/s);
      const questionMatch = v.match(/\*\*One Question to Sit With:\*\* \*(.*?)\*(?=\n\n|$)/s);
      
      const parts = v.split('\n\n**Biggest');
      const narrative = parts[0].split('\n').slice(1).join('\n').trim();

      content.archetypes[key].push({
          narrative: narrative.trim(),
          opportunity: oppMatch ? oppMatch[1].trim() : "",
          mistake: mistMatch ? mistMatch[1].trim() : "",
          focus: focusMatch ? focusMatch[1].trim() : "",
          question: questionMatch ? questionMatch[1].trim() : ""
      });
  });
});

fs.writeFileSync('client/src/data/content.json', JSON.stringify(content, null, 2));
