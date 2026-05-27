(function() {
    const glossaryData = [
        { term: "SRI", def: "Serotonin Reuptake Inhibitor" },
        { term: "NRI", def: "Norepinephrine Reuptake Inhibitor" },
        { term: "DRI", def: "Dopamine Reuptake Inhibitor" },
        { term: "SNRI", def: "Serotonin Norepinephrine Reuptake Inhibitor" },
        { term: "SDRI", def: "Serotonin Dopamine Reuptake Inhibitor" },
        { term: "NDRI", def: "Norepinephrine Dopamine Reuptake Inhibitor" },
        { term: "SNDRI", def: "Serotonin Norepinephrine Dopamine Reuptake Inhibitor" },
        { term: "SRE", def: "Serotonin Reuptake Enhancer" },
        { term: "NRE", def: "Norepinephrine Reuptake Enhancer" },
        { term: "DRE", def: "Dopamine Reuptake Enhancer" },
        { term: "SNRE", def: "Serotonin Norepinephrine Reuptake Enhancer" },
        { term: "SDRE", def: "Serotonin Dopamine Reuptake Enhancer" },
        { term: "SNDRE", def: "Serotonin Norepinephrine Dopamine Reuptake Enhancer" },
        { term: "SRA", def: "Serotonin Releasing Agent" },
        { term: "NRA", def: "Norepinephrine Releasing Agent" },
        { term: "DRA", def: "Dopamine Releasing Agent" },
        { term: "SNRA", def: "Serotonin Norepinephrine Releasing Agent" },
        { term: "SDRA", def: "Serotonin Dopamine Releasing Agent" },
        { term: "NDRA", def: "Norepinephrine Dopamine Releasing Agent" },
        { term: "SNDRA", def: "Serotonin Norepinephrine Dopamine Releasing Agent" },
        { term: "SMS", def: "Serotonin Modulator and Stimulator" },
        { term: "NMS", def: "Norepinephrine Modulator and Stimulator" },
        { term: "DMS", def: "Dopamine Modulator and Stimulator" },
        { term: "SNMS", def: "Serotonin Norepinephrine Modulator and Stimulator" },
        { term: "SDMS", def: "Serotonin Modulator and Stimulator" },
        { term: "NDMS", def: "Norepinephrine Dopamine Modulator and Stimulator" },
        { term: "SNDMS", def: "Serotonin Norepinephrine Dopamine Modulator and Stimulator" },
        { term: "SAg", def: "Serotonin Agonist" },
        { term: "NAg", def: "Norepinephrine Agonist" },
        { term: "DAg", def: "Dopamine Agonist" },
        { term: "SNAg", def: "Serotonin Norepinephrine Agonist" },
        { term: "SDAg", def: "Serotonin Dopamine Agonist" },
        { term: "SNDAg", def: "Serotonin Norepinephrine Dopamine Agonist" },
        { term: "SAn", def: "Serotonin Antagonist" },
        { term: "NAn", def: "Norepinephrine Antagonist" },
        { term: "DAn", def: "Dopamine Antagonist" },
        { term: "SNAn", def: "Serotonin Norepinephrine Antagonist" },
        { term: "SDAn", def: "Serotonin Dopamine Antagonist" },
        { term: "SNDAn", def: "Serotonin Norepinephrine Dopamine Antagonist" },
        { term: "SSA", def: "Selective Serotonin Agonist" },
        { term: "NSA", def: "Selective Norepinephrine Agonist" },
        { term: "DSA", def: "Selective Dopamine Agonist" },
        { term: "SNSA", def: "Selective Serotonin Norepinephrine Agonist" },
        { term: "SDSA", def: "Selective Serotonin Dopamine Agonist" },
        { term: "NDSA", def: "Selective Norepinephrine Dopamine Agonist" },
        { term: "SNDSA", def: "Selective Serotonin Norepinephrine Dopamine Agonist" },
        { term: "SIAg", def: "Serotonin Inversed Agonist" },
        { term: "NIAg", def: "Norepinephrine Inversed Agonist" },
        { term: "DIAg", def: "Dopamine Inversed Agonist" },
        { term: "SNIAg", def: "Serotonin Norepinephrine Inversed Agonist" },
        { term: "SDIAg", def: "Serotonin Dopamine Inversed Agonist" },
        { term: "NDIAg", def: "Norepinephrine Dopamine Inversed Agonist" },
        { term: "SNDIAg", def: "Serotonin Norepinephrine Dopamine Inversed Agonist" },
        { term: "SIAn", def: "Serotonin Inversed Antagonist" },
        { term: "NIAn", def: "Norepinephrine Inversed Antagonist" },
        { term: "DIAn", def: "Dopamine Inversed Antagonist" },
        { term: "SNIAn", def: "Serotonin Norepinephrine Inversed Antagonist" },
        { term: "SDIAn", def: "Serotonin Dopamine Inversed Antagonist" },
        { term: "NDIAn", def: "Norepinephrine Dopamine Inversed Antagonist" },
        { term: "SNDIAn", def: "Serotonin Norepinephrine Dopamine Inversed Antagonist" },
        { term: "MAOI", def: "Monoamine Oxidase Inhibitor" },
        { term: "IMAO-A", def: "Inhibitor of Monoamine Oxidase A" },
        { term: "IMAO-B", def: "Inhibitor of Monoamine Oxidase B" },
        { term: "RIM-A", def: "Reversible Inhibitor of Monoamine Oxidase A" },
        { term: "RIM-B", def: "Reversible Inhibitor of Monoamine Oxidase B" },
        { term: "TCA", def: "TriCyclic Antidepressant" },
        { term: "TeCA", def: "TetraCyclic Antidepressant" },
        { term: "SERT", def: "SERotonin Transporter" },
        { term: "NET", def: "NorEpinephrine Transporter" },
        { term: "DAT", def: "DopAmine Transporter" },
    ];

    const tagsData = [
        "H",
        "mACh",
        "MT",
        "NMDA",
        "AMPA",
        "Monoamine releasing agents",
        "Monoamine receptor modulators",
        "GABA",
        "k-Opioid",
        "Nociceptin",
        "Muscarinic Acetylcholine",
        "Orexin",
        "u-opioid receptor",
        "Anaphrodisiac",
        "Antipsychotic",
        "Anxiogenic",
        "Anxiolytic",
        "Aphrodisiac",
        "Entheogen",
        "Eugeroic",
        "Mood stabilizer",
        "Psychedelic drug",
        "Psycholeptic",
        "Psychotomimetism",
        "Hypnotics",
        "Sedatives",
        "Anorectics",
        "Anxiogenics",
        "Anxiolytics",
        "Aphrodisiacs",
        "Deliriants",
        "Depressogens",
        "Dissociative drugs",
        "Entactogens and empathogens",
        "Euphoriants",
        "Mood stabilizers",
        "Oneirogens",
        "Psychedelic drugs",
        "Psychoanaleptics",
        "Psycholeptics",
        "Stimulants",
        "Nicotinic acetylcholine receptor modulators",
        "Acetylcholine metabolism and transport modulators",
        "TAAR ligands",
    ];

    function renderGlossary() {
        const grid = document.getElementById('glossary-items');
        if (grid) {
            grid.innerHTML = glossaryData.map(item => `
                <div class="glossary-card" data-term="${item.term}" data-def="${item.def}">
                    <span class="glossary-badge">${item.term}</span>
                    <p class="glossary-definition">${item.def}</p>
                </div>
            `).join('');
        }

        const tagsContainer = document.getElementById('glossary-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = tagsData.map(tag => `
                <span class="glossary-tag">${tag}</span>
            `).join('');
        }
    }

    function init() {
        renderGlossary();
        
        const searchInput = document.getElementById('glossary-search');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                const query = e.target.value.toLowerCase().trim();
                
                const cards = document.querySelectorAll('.glossary-card');
                cards.forEach(card => {
                    const term = card.getAttribute('data-term').toLowerCase();
                    const def = card.getAttribute('data-def').toLowerCase();
                    if (term.includes(query) || def.includes(query)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });

                const tags = document.querySelectorAll('.glossary-tag');
                tags.forEach(tag => {
                    const name = tag.textContent.toLowerCase();
                    if (name.includes(query)) {
                        tag.style.display = 'inline-block';
                    } else {
                        tag.style.display = 'none';
                    }
                });
            });
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
    
    // Also run init when page is loaded via SPA router
    document.addEventListener('page:loaded', (e) => {
        if (e.detail.url.includes('glossary.html')) {
            init();
        }
    });

})();
