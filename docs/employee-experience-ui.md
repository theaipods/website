# Employee Experience UI

The public `/solutions/employee-experience` page is implemented by `components/EmployeeExperienceRedesign.tsx` and scoped `app/employee-experience-redesign.css`. Its independent welcome-pack hero lives in `components/PageSpecificHeroes.tsx` and `app/page-specific-heroes.css`: the Employee Assistant stands beside an animated welcome letter, access request and first-week plan. It shares navigation/footer, not the homepage composition.

Lifecycle selection starts at Onboard and updates local explanatory text. Workflow pills update suggested actions; the role selector retains both registered HR employees. The chat preview and knowledge form do not contact a model or read private documents. They expose a sign-in action after sample submission. Knowledge source selection updates the panel and clears the sample query. Chart month selection updates fictional support-volume values. The 4.2-hour resolution-time figure is explicitly illustrative. No customer analytics are queried.

Desktop follows the supplied light mint reference. Small screens keep lifecycle cards horizontally scrollable and stack assistant, knowledge and chart content. All controls are keyboard accessible and motion respects user preferences.

Employee Experience sections use a larger marketing scale: a 1320px desktop content cap, approximately 750px hero, 110px section padding, and fluid section headings up to 70px matching Integrations and enlarged cards, mascot previews and chart labels. Tablet and mobile retain adaptive spacing and stacked layouts.

Lifecycle cards use seven distinct existing HD illustrations: marketing elephant (Attract), HR deer (Hire), project squirrel (Onboard), support otter (Support), research fox (Develop), data sprite (Retain), and security chameleon (Offboard). These are illustrative stage visuals, not seven new HR registry roles. The hero and assistant preview retain the otter.
