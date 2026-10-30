import {generate,type ModelRequest} from './providers';

// Accept a JSON object even when a provider adds a markdown fence or short preface.
// Track quoted strings and nesting; never evaluate code or repair field values locally.
export function parseModelObject(text:string):unknown{
 const start=text.indexOf('{');if(start<0)throw new Error('No JSON object returned.');
 let depth=0,quoted=false,escaped=false;
 for(let i=start;i<text.length;i++){
  const c=text[i];
  if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
  if(c==='"')quoted=true;
  else if(c==='{')depth++;
  else if(c==='}'&&--depth===0)return JSON.parse(text.slice(start,i+1));
 }
 throw new Error('Incomplete JSON object returned.');
}
export async function generateModelObject(input:ModelRequest):Promise<unknown>{
 const request={...input,json:true,instructions:`${input.instructions}\nReturn exactly one valid JSON object. No markdown, explanations or comments outside the JSON. Escape line breaks inside strings.`};
 const output=await generate(request);
 try{return parseModelObject(output);}catch{
  // One bounded retry for formatting only. Provider/auth failures are not retried.
  const retry=await generate({...request,task:`${input.task}\nThe previous response was invalid JSON. Produce a fresh complete JSON object following the original schema. Keep values concise.`,maxOutputTokens:input.maxOutputTokens});
  return parseModelObject(retry);
 }
}
