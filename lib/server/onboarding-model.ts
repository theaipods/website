import {modelConfig} from './model-config';
import {generate, ProviderFailure, type ModelRequest} from './providers';
import {parseModelObject} from './model-json';

// Scoped to onboarding. Never change the provider of a live Pod or its vector index.
export function onboardingProviders() {
  const primary=modelConfig('chat').provider;
  const order=(process.env.ONBOARDING_AI_PROVIDERS || 'primary,groq,openrouter,huggingface').split(',').map(p=>p.trim().toLowerCase()).map(p=>p==='primary'?primary:p);
  return [...new Set(order)].filter(p=>['nvidia','azure','bedrock','legacy','groq','openrouter','huggingface'].includes(p))
    .filter(p=>p!=='huggingface'||process.env.HUGGINGFACE_ENABLED==='true')
    .filter(p=>{const c=modelConfig('chat',p);return c.supported&&c.model&&(c.format==='bedrock'?p===primary&&c.region: c.key&&c.url);}).slice(0,4);
}
export async function onboardingObject<T>(input:ModelRequest, validate:(value:unknown)=>T|undefined) {
  const warnings:string[]=[]; const providers=onboardingProviders(); const deadline=Date.now()+100000;
  for(const provider of providers) {
    // A single configured provider gets one schema/format repair, never a retry for throttling.
    for(let attempt=0;attempt<(providers.length===1?2:1);attempt++) {
      const remaining=deadline-Date.now(); if(remaining<1000)break;
      try {
        const output=await generate({...input,json:true,task:input.task+(attempt?' Return a complete JSON object matching every required field in fieldShapes; the previous response failed validation.':'')},{provider,timeoutMs:Math.min(45000,remaining)});
        let parsed:unknown;try{parsed=parseModelObject(output);}catch{throw new SyntaxError('Invalid JSON object');}
        const value=validate(parsed);
        if(value!==undefined)return {value,model:`${provider} / ${modelConfig('chat',provider).model}`,warnings};
        warnings.push(`${provider}: response did not contain usable fields.`);
      } catch(error) {
        if(error instanceof ProviderFailure && error.refused)throw error;
        if(error instanceof ProviderFailure) {
          warnings.push(`${provider}: ${error.providerStatus===429?'rate limit':error.providerStatus===401||error.providerStatus===403?'access denied':`HTTP ${error.providerStatus}`}; trying the next configured provider.`);
          break;
        }
        warnings.push(`${provider}: ${error instanceof Error&&/timeout|abort/i.test(error.name)?'request timed out':'response unavailable or invalid'}.`);
        if(!(error instanceof SyntaxError))break;
      }
    }
  }
  return {value:undefined,model:'Built-in starter',warnings:providers.length?warnings:['No onboarding chat provider is configured. Using editable starter suggestions.']};
}
