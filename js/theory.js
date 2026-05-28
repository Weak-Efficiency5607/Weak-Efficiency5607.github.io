(() => {
const causesData = [
    {
        "title": "Attention Deficit Hyperactivity Disorder (ADHD) Induced",
        "links": []
    },
    {
        "title": "Autism Induced",
        "links": []
    },
    {
        "title": "Chronic Infection Induced (examples: Lyme disease, Epstein-Barr virus, Bartonella)",
        "links": []
    },
    {
        "title": "Immune Disorders (examples: Lupus?, Rheumatoid Arthritis?)",
        "links": []
    },
    {
        "title": "Leaky Gut",
        "links": []
    },
    {
        "title": "Leaky BBB (blood-brain barrier)",
        "links": []
    },
    {
        "title": "Mold Induced (example: Mold Exposure)",
        "links": []
    },
    {
        "title": "Too much Dopamine activity",
        "links": []
    },
    {
        "title": "Dopamine Toxicity Induced",
        "links": []
    },
    {
        "title": "Too much Serotonin activity",
        "links": []
    },
    {
        "title": "Too little Serotonin activity",
        "links": []
    },
    {
        "title": "Caffeine Tolerance Induced",
        "links": []
    },
    {
        "title": "Food Allergy or Intolerance Induced",
        "links": []
    },
    {
        "title": "Porno Induced?",
        "links": []
    },
    {
        "title": "Masturbation Induced?",
        "links": []
    },
    {
        "title": "Too much GABA activity",
        "links": []
    },
    {
        "title": "Too much opioid activity",
        "links": []
    },
    {
        "title": "Too little GABA activity",
        "links": []
    },
    {
        "title": "Alcohol Induced",
        "links": []
    },
    {
        "title": "Burnout Syndrome Induced",
        "links": []
    },
    {
        "title": "Serotonin Toxicity Induced",
        "links": []
    },
    {
        "title": "Ashwagandha Induced",
        "links": []
    },
    {
        "title": "Lion's mane Induced",
        "links": []
    },
    {
        "title": "NAC Induced",
        "links": []
    },
    {
        "title": "Nicotine Tolerance Induced",
        "links": []
    },
    {
        "title": "Lithium Induced",
        "links": []
    },
    {
        "title": "Drug (examples: Cocaine, MDMA, Weed) Induced",
        "links": []
    },
    {
        "title": "Antipsychotics Induced",
        "links": []
    },
    {
        "title": "Dopamine Agonist Withdrawal Syndrome (DAWS) Induced",
        "links": []
    },
    {
        "title": "Finasteride Induced",
        "links": []
    },
    {
        "title": "Accutane Induced",
        "links": []
    },
    {
        "title": "Stimulants Induced",
        "links": []
    },
    {
        "title": "Benzodiazepines Induced",
        "links": []
    },
    {
        "title": "Trauma Induced",
        "links": []
    },
    {
        "title": "Stroke Induced",
        "links": []
    },
    {
        "title": "Obsessive Compulsive Disorder (OCD) Induced",
        "links": []
    },
    {
        "title": "Sleep Deprivation Induced",
        "links": []
    },
    {
        "title": "Serotonin Syndrome Induced",
        "links": []
    },
    {
        "title": "Alcohol Hangover Induced",
        "links": []
    },
    {
        "title": "Traumatic Brain Injury (TBI) Induced",
        "links": []
    },
    {
        "title": "Chronic Pain (example: Chronic Headache) Induced",
        "links": []
    },
    {
        "title": "Too much Norepinephrine activity",
        "links": []
    },
    {
        "title": "Too much Adrenaline activity",
        "links": []
    },
    {
        "title": "Too much Glutamate activity",
        "links": []
    },
    {
        "title": "Too much Acetylcholine activity",
        "links": []
    },
    {
        "title": "Too little Norepinephrine activity",
        "links": []
    },
    {
        "title": "Too little Dopamine activity",
        "links": []
    },
    {
        "title": "Too little Adrenaline activity",
        "links": []
    },
    {
        "title": "Too little Glutamate activity",
        "links": []
    },
    {
        "title": "Too little Acetylcholine activity",
        "links": []
    },
    {
        "title": "Too little opioid activity",
        "links": []
    },
    {
        "title": "Too little Neuroplasticity",
        "links": []
    },
    {
        "title": "Glutamate Toxicity Induced",
        "links": []
    },
    {
        "title": "Excitotoxicity",
        "links": []
    },
    {
        "title": "Serotonine Reuptake Inhibitors (SRIs, SSRIs, SNRIs, SMSs, many TCAs and TeCAs ...) Induced",
        "links": []
    },
    {
        "title": "Psychosis Induced",
        "links": []
    },
    {
        "title": "Bad Intestinal Flora Induced",
        "links": []
    },
    {
        "title": "Chronic and Intense Stress Induced",
        "links": []
    },
    {
        "title": "Major Depressive Disorder Induced",
        "links": []
    },
    {
        "title": "Long Covid Induced",
        "links": []
    },
    {
        "title": "Sleep Disorders (example: Apnea) Induced",
        "links": []
    },
    {
        "title": "Vitamin Deficiency Induced (examples: Vitamin D, Vitamin B)",
        "links": []
    },
    {
        "title": "Mineral Deficiency Induced (example: Iron)",
        "links": []
    },
    {
        "title": "Low Testosterone Induced",
        "links": []
    },
    {
        "title": "Thyroid Problems (example: Hypothyroidism) Induced",
        "links": []
    },
    {
        "title": "Cortisol Induced",
        "links": []
    },
    {
        "title": "Cushing Disease Induced",
        "links": []
    },
    {
        "title": "Myalgic encephalomyelitis / Chronic Fatigue (ME/CFS) Induced",
        "links": []
    },
    {
        "title": "Inflammation / Neuroinflammation / Chronic inflammation Induced",
        "links": []
    },
    {
        "title": "Schizophrenia Induced",
        "links": []
    },
    {
        "title": "Depression Induced",
        "links": []
    },
    {
        "title": "Hormonal Birth Control implants / Pills Induced",
        "links": []
    },
    {
        "title": "Genetic (examples: Warrior gene, MTFHR) Induced",
        "links": []
    },
    {
        "title": "Lyme Disease Induced",
        "links": []
    },
    {
        "title": "Depersonalization-derealization disorder (DPDR or DDD)",
        "links": []
    },
    {
        "title": "Social Isolation or Loneliness Induced",
        "links": []
    },
    {
        "title": "Gastrointestinal Issues (examples: Gut Dysbiosis, SIBO)",
        "links": []
    },
    {
        "title": "Environmental Toxins (examples: Heavy Metals, Pollutants) Induced",
        "links": []
    },
    {
        "title": "Postpartum Changes and Hormonal Fluctuations Induced",
        "links": []
    },
    {
        "title": "Chronic Kidney Disease Induced",
        "links": []
    },
    {
        "title": "Wilson Disease Induced",
        "links": []
    },
    {
        "title": "Huntington Disease Induced",
        "links": []
    },
    {
        "title": "Parkinson Disease Induced",
        "links": []
    },
    {
        "title": "Hashimoto Disease Induced",
        "links": []
    },
    {
        "title": "Celiac Disease Induced",
        "links": []
    },
    {
        "title": "Multiple Sclerosis Disease Induced",
        "links": []
    },
    {
        "title": "Korsakoff Disease Induced",
        "links": []
    },
    {
        "title": "Premenstrual Syndrome (PMS) Induced",
        "links": []
    },
    {
        "title": "Mononucleosis (Epstein Barr Virus (EBV)) Induced",
        "links": []
    },
    {
        "title": "Metabolic Disorders (Obesity, Metabolic Syndrome, Hypometabolism) Induced",
        "links": []
    },
    {
        "title": "Adrenal Dysfunction Induced",
        "links": []
    },
    {
        "title": "HPA Axis Dysregulation Induced",
        "links": []
    },
    {
        "title": "Hormonal Imbalances (examples: Thyroid, Cortisol?)",
        "links": []
    },
    {
        "title": "Medication Side Effects (Antidepressants, Antipsychotics, Hypertension Drugs?)",
        "links": []
    },
    {
        "title": "Neurodegenerative diseases (example: Alzheimer, Dementia)",
        "links": []
    },
    {
        "title": "CBD Induced",
        "links": []
    },
    {
        "title": "Covid (example: Omicron variant?) Induced",
        "links": []
    },
    {
        "title": "Covid Vaccine Induced",
        "links": []
    },
    {
        "title": "Candida Induced?",
        "links": []
    },
    {
        "title": "Autoimmune Induced",
        "links": []
    },
    {
        "title": "Schizoid Personality Disorder (SPD, SzPD or ScPD)",
        "links": []
    },
    {
        "title": "Borderline Personality Disorder (BPD)",
        "links": []
    },
    {
        "title": "Antibiotics Induced",
        "links": []
    },
    {
        "title": "Iron Overload Induced",
        "links": []
    },
    {
        "title": "Bipolar Disorder (BD) Induced",
        "links": []
    },
    {
        "title": "Dysthymia Induced",
        "links": []
    },
    {
        "title": "Schizoaffective Disorder Induced",
        "links": []
    },
    {
        "title": "Post-Traumatic Stress Disorder (PTSD) Induced",
        "links": []
    },
    {
        "title": "Fibromyalgia Induced",
        "links": []
    },
    {
        "title": "Addison's Disease Induced",
        "links": []
    },
    {
        "title": "Chronic Obstructive Pulmonary Disease (COPD) Induced",
        "links": []
    }
];

    const grid = document.querySelector('.masonry-grid');
    if (!grid) return;
    
    // grid.innerHTML = ''; // We'll let the HTML be empty initially
    if (grid.children.length > 0) return; // Prevent duplicate cards on re-evaluation
    
    causesData.forEach(cause => {
        const card = document.createElement('div');
        card.className = 'cause-card';
        
        let html = `<h3 class="cause-title">${cause.title}</h3>`;
        
        if (cause.links && cause.links.length > 0) {
            html += `<div class="cause-links">`;
            cause.links.forEach(link => {
                html += ` <a href="${link.url}" target="_blank" class="resource-link">
                            <span class="link-icon">↗</span> ${link.text}
                        </a> `;
            });
            html += `</div>`;
        }
        
        card.innerHTML = html;
        grid.appendChild(card);
    });
})();
