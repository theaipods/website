export type ProfileField = 'name' | 'about' | 'products' | 'industry' | 'businessModel' | 'geography' | 'size';
export type ResearchSource = { url: string; title: string; text: string; status: string; provider: string; kind: 'official' | 'directory'; };
export type ResearchReport = { at: string; website: string; sources: ResearchSource[]; suggestions: { field: ProfileField; value: string; source: string; confidence: 'extracted' | 'suggested' }[]; warnings: string[]; discovered: number; limit: number; knowledgeId?: string };
