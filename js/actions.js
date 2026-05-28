
(function () {
	async function init() {
		// Wait for marked library if needed
		const urlParams = new URLSearchParams(window.location.search);
		const mdFile = urlParams.get('md');
		if (mdFile && typeof marked === 'undefined') {
			setTimeout(init, 100);
			return;
		}

		const searchInput = document.getElementById('wiki-search');
		const searchResults = document.getElementById('search-results');
		if (!searchInput || !searchResults) return;

		const wikiData = {
			"Alone": [
				{
					"href": "wiki/alone-fever.html",
					"title": "Fever / Pyrexia",
					"wiki": "https://en.wikipedia.org/wiki/Fever"
				},
				{
					"href": "wiki/alone-l-tyrosine.html",
					"title": "L-Tyrosine",
					"wiki": "https://en.wikipedia.org/wiki/L-Tyrosine"
				},
				{
					"href": "wiki/alone-l-tryptophan.html",
					"title": "L-Tryptophan",
					"wiki": "https://en.wikipedia.org/wiki/L-Tryptophan"
				},
				{
					"href": "wiki/alone-turmeric.html",
					"title": "Turmeric",
					"wiki": "https://en.wikipedia.org/wiki/Turmeric"
				},
				{
					"href": "wiki/alone-coffee.html",
					"title": "Coffee",
					"wiki": "https://en.wikipedia.org/wiki/Coffee"
				},
				{
					"href": "wiki/alone-cow-milk.html",
					"title": "Cow Milk",
					"wiki": "https://en.wikipedia.org/wiki/Cow_milk"
				},
				{
					"href": "wiki/alone-vitamin-d.html",
					"title": "Vitamin D",
					"wiki": "https://en.wikipedia.org/wiki/Vitamin_D"
				},
				{
					"href": "wiki/alone-same.html",
					"title": "SAMe",
					"wiki": "https://en.wikipedia.org/wiki/SAMe"
				},
				{
					"href": "wiki/alone-multivitamins-multiminerals.html",
					"title": "Multivitamins and Multiminerals"
				},
				{
					"href": "wiki/alone-vortioxetine.html",
					"title": "Vortioxetine",
					"wiki": "https://en.wikipedia.org/wiki/Vortioxetine"
				},
				{
					"href": "wiki/alone-bromantane.html",
					"title": "Bromantane",
					"wiki": "https://en.wikipedia.org/wiki/Bromantane"
				},
				{
					"href": "wiki/alone-piracetam.html",
					"title": "Piracetam",
					"wiki": "https://en.wikipedia.org/wiki/Piracetam"
				},
				{
					"href": "wiki/alone-spirulina.html",
					"title": "Spirulina",
					"wiki": "https://en.wikipedia.org/wiki/Spirulina"
				},
				{
					"href": "wiki/alone-probiotics-prebiotics.html",
					"title": "Probiotiques et Pr\u00e9biotiques"
				},
				{
					"href": "wiki/alone-methylene-blue.html",
					"title": "Methylene Blue",
					"wiki": "https://en.wikipedia.org/wiki/Methylene_blue"
				},
				{
					"href": "wiki/alone-alcar.html",
					"title": "ALCAR",
					"wiki": "https://en.wikipedia.org/wiki/ALCAR"
				},
				{
					"href": "wiki/alone-inositol.html",
					"title": "Inositol",
					"wiki": "https://en.wikipedia.org/wiki/Inositol"
				},
				{
					"href": "wiki/alone-choline.html",
					"title": "Choline",
					"wiki": "https://en.wikipedia.org/wiki/Choline"
				},
				{
					"href": "wiki/alone-agmatine.html",
					"title": "Agmatine",
					"wiki": "https://en.wikipedia.org/wiki/Agmatine"
				},
				{
					"href": "wiki/alone-flmodafinil.html",
					"title": "Flmodafinil",
					"wiki": "https://en.wikipedia.org/wiki/Flmodafinil"
				},
				{
					"href": "wiki/alone-nicotine.html",
					"title": "Nicotine",
					"wiki": "https://en.wikipedia.org/wiki/Nicotine"
				},
				{
					"href": "wiki/alone-sulbutiamine.html",
					"title": "Sulbutiamine",
					"wiki": "https://en.wikipedia.org/wiki/Sulbutiamine"
				},
				{
					"href": "wiki/alone-fluoxetine.html",
					"title": "Fluoxetine",
					"wiki": "https://en.wikipedia.org/wiki/Fluoxetine"
				},
				{
					"href": "wiki/alone-tak-653.html",
					"title": "TAK-653",
					"wiki": "https://en.wikipedia.org/wiki/TAK-653"
				},
				{
					"href": "wiki/alone-tropisetron.html",
					"title": "Tropisetron",
					"wiki": "https://en.wikipedia.org/wiki/Tropisetron"
				},
				{
					"href": "wiki/alone-nad+.html",
					"title": "NAD+",
					"wiki": "https://en.wikipedia.org/wiki/NAD%2B"
				},
				{
					"href": "wiki/alone-huperzine-a.html",
					"title": "Huperzine A",
					"wiki": "https://en.wikipedia.org/wiki/Huperzine_A"
				},
				{
					"href": "wiki/alone-safinamide.html",
					"title": "Safinamide Mesylate",
					"wiki": "https://en.wikipedia.org/wiki/Safinamide_mesylate"
				},
				{
					"href": "wiki/alone-l-dopa.html",
					"title": "L-DOPA",
					"wiki": "https://en.wikipedia.org/wiki/L-DOPA"
				},
				{
					"href": "wiki/alone-neboglamine.html",
					"title": "Neboglamine",
					"wiki": "https://en.wikipedia.org/wiki/Neboglamine"
				},
				{
					"href": "wiki/alone-licorice-root.html",
					"title": "Licorice Root",
					"wiki": "https://en.wikipedia.org/wiki/Licorice_root"
				},
				{
					"href": "wiki/alone-selenium.html",
					"title": "Selenium",
					"wiki": "https://en.wikipedia.org/wiki/Selenium"
				},
				{
					"href": "wiki/alone-vinpocetine.html",
					"title": "Vinpocetine",
					"wiki": "https://en.wikipedia.org/wiki/Vinpocetine"
				},
				{
					"href": "wiki/alone-idebenone.html",
					"title": "Idebenone",
					"wiki": "https://en.wikipedia.org/wiki/Idebenone"
				},
				{
					"href": "wiki/alone-dmae.html",
					"title": "DMAE",
					"wiki": "https://en.wikipedia.org/wiki/DMAE"
				},
				{
					"href": "wiki/alone-cordyceps-militaris.html",
					"title": "Cordyceps Militaris",
					"wiki": "https://en.wikipedia.org/wiki/Cordyceps_militaris"
				},
				{
					"href": "wiki/alone-hemp.html",
					"title": "Hemp",
					"wiki": "https://en.wikipedia.org/wiki/Hemp"
				},
				{
					"href": "wiki/alone-rhodiola-rosea.html",
					"title": "Rhodiola rosea",
					"wiki": "https://en.wikipedia.org/wiki/Rhodiola_rosea"
				},
				{
					"href": "wiki/alone-black-pepper.html",
					"title": "Black Pepper",
					"wiki": "https://en.wikipedia.org/wiki/Black_pepper"
				},
				{
					"href": "wiki/alone-shiitake.html",
					"title": "Shiitake",
					"wiki": "https://en.wikipedia.org/wiki/Shiitake"
				},
				{
					"href": "wiki/alone-paracetamol.html",
					"title": "Paracetamol",
					"wiki": "https://en.wikipedia.org/wiki/Paracetamol"
				},
				{
					"href": "wiki/alone-st-john-wort.html",
					"title": "St. John's Wort",
					"wiki": "https://en.wikipedia.org/wiki/St._John%27s_Wort"
				},
				{
					"href": "wiki/alone-passiflora.html",
					"title": "Passiflora",
					"wiki": "https://en.wikipedia.org/wiki/Passiflora"
				},
				{
					"href": "wiki/alone-cbd.html",
					"title": "CBD",
					"wiki": "https://en.wikipedia.org/wiki/CBD"
				},
				{
					"href": "wiki/alone-aripiprazol.html",
					"title": "Aripiprazol",
					"wiki": "https://en.wikipedia.org/wiki/Aripiprazole"
				},
				{
					"href": "wiki/alone-venlafaxine.html",
					"title": "Venlafaxine",
					"wiki": "https://en.wikipedia.org/wiki/Venlafaxine"
				},
				{
					"href": "wiki/alone-gaba.html",
					"title": "GABA",
					"wiki": "https://en.wikipedia.org/wiki/GABA"
				},
				{
					"href": "wiki/alone-5-meo-dalt.html",
					"title": "5-MeO-DALT",
					"wiki": "https://en.wikipedia.org/wiki/5-MeO-DALT"
				},
				{
					"href": "wiki/alone-amt.html",
					"title": "AMT",
					"wiki": "https://en.wikipedia.org/wiki/AMT"
				},
				{
					"href": "wiki/alone-nm-2-ai.html",
					"title": "NM-2-AI",
					"wiki": "https://en.wikipedia.org/wiki/NM-2-AI"
				},
				{
					"href": "wiki/alone-3-mma.html",
					"title": "3-MMA",
					"wiki": "https://en.wikipedia.org/wiki/3-MMA"
				},
				{
					"href": "wiki/alone-4-ho-met.html",
					"title": "4-HO-MET",
					"wiki": "https://en.wikipedia.org/wiki/4-HO-MET"
				},
				{
					"href": "wiki/alone-tianeptine.html",
					"title": "Tianeptine",
					"wiki": "https://en.wikipedia.org/wiki/Tianeptine"
				},
				{
					"href": "wiki/alone-dck.html",
					"title": "DCK",
					"wiki": "https://en.wikipedia.org/wiki/DCK"
				},
				{
					"href": "wiki/alone-5-meo-mipt.html",
					"title": "5-MeO-MiPT",
					"wiki": "https://en.wikipedia.org/wiki/5-MeO-MiPT"
				},
				{
					"href": "wiki/alone-norflurazepam.html",
					"title": "Norflurazepam",
					"wiki": "https://en.wikipedia.org/wiki/Norflurazepam"
				},
				{
					"href": "wiki/alone-moclobemide.html",
					"title": "Moclobemide",
					"wiki": "https://en.wikipedia.org/wiki/Moclobemide"
				},
				{
					"href": "wiki/alone-ibuprofene.html",
					"title": "Ibuprofene",
					"wiki": "https://en.wikipedia.org/wiki/Ibuprofen"
				},
				{
					"href": "wiki/alone-noopept.html",
					"title": "Noopept",
					"wiki": "https://en.wikipedia.org/wiki/Noopept"
				},
				{
					"href": "wiki/alone-cgp.html",
					"title": "cGP",
					"wiki": "https://en.wikipedia.org/wiki/CGP"
				},
				{
					"href": "wiki/alone-igf-1.html",
					"title": "IGF-1",
					"wiki": "https://en.wikipedia.org/wiki/IGF-1"
				},
				{
					"href": "wiki/alone-tranylcypromine.html",
					"title": "Tranylcypromine",
					"wiki": "https://en.wikipedia.org/wiki/Tranylcypromine"
				},
				{
					"href": "wiki/alone-prl-8-53.html",
					"title": "PRL-8-53",
					"wiki": "https://en.wikipedia.org/wiki/PRL-8-53"
				},
				{
					"href": "wiki/alone-sulforaphane.html",
					"title": "Sulforaphane",
					"wiki": "https://en.wikipedia.org/wiki/Sulforaphane"
				},
				{
					"href": "wiki/alone-melatonin.html",
					"title": "Melatonin",
					"wiki": "https://en.wikipedia.org/wiki/Melatonin"
				},
				{
					"href": "wiki/alone-inosine.html",
					"title": "Inosine",
					"wiki": "https://en.wikipedia.org/wiki/Inosine"
				},
				{
					"href": "wiki/alone-caffeine.html",
					"title": "Caffeine",
					"wiki": "https://en.wikipedia.org/wiki/Caffeine"
				},
				{
					"href": "wiki/alone-paraxanthine.html",
					"title": "Paraxanthine",
					"wiki": "https://en.wikipedia.org/wiki/Paraxanthine"
				},
				{
					"href": "wiki/alone-theobromine.html",
					"title": "Theobromine",
					"wiki": "https://en.wikipedia.org/wiki/Theobromine"
				},
				{
					"href": "wiki/alone-theophylline.html",
					"title": "Theophylline",
					"wiki": "https://en.wikipedia.org/wiki/Theophylline"
				},
				{
					"href": "wiki/alone-lactoferrine.html",
					"title": "Lactoferrine",
					"wiki": "https://en.wikipedia.org/wiki/Lactoferrin"
				},
				{
					"href": "wiki/alone-collagen.html",
					"title": "Collagen",
					"wiki": "https://en.wikipedia.org/wiki/Collagen"
				},
				{
					"href": "wiki/alone-green-tea.html",
					"title": "Green Tea",
					"wiki": "https://en.wikipedia.org/wiki/Green_tea"
				},
				{
					"href": "wiki/alone-guarana.html",
					"title": "Guarana",
					"wiki": "https://en.wikipedia.org/wiki/Guarana"
				},
				{
					"href": "wiki/alone-dihexa.html",
					"title": "Dihexa",
					"wiki": "https://en.wikipedia.org/wiki/Dihexa"
				},
				{
					"href": "wiki/alone-homotaurine.html",
					"title": "Homotaurine",
					"wiki": "https://en.wikipedia.org/wiki/Homotaurine"
				},
				{
					"href": "wiki/alone-phenibut.html",
					"title": "Phenibut",
					"wiki": "https://en.wikipedia.org/wiki/Phenibut"
				},
				{
					"href": "wiki/alone-lemon-balm-water.html",
					"title": "Lemon Balm Water"
				},
				{
					"href": "wiki/alone-tilorone.html",
					"title": "Tilorone",
					"wiki": "https://en.wikipedia.org/wiki/Tilorone"
				},
				{
					"href": "wiki/alone-alanine.html",
					"title": "Alanine",
					"wiki": "https://en.wikipedia.org/wiki/Alanine"
				},
				{
					"href": "wiki/alone-lysine.html",
					"title": "Lysine",
					"wiki": "https://en.wikipedia.org/wiki/Lysine"
				},
				{
					"href": "wiki/alone-isoleucine.html",
					"title": "Isoleucine",
					"wiki": "https://en.wikipedia.org/wiki/Isoleucine"
				},
				{
					"href": "wiki/alone-aspartic-acid.html",
					"title": "Aspartic acid",
					"wiki": "https://en.wikipedia.org/wiki/Aspartic_acid"
				},
				{
					"href": "wiki/alone-proline.html",
					"title": "Proline",
					"wiki": "https://en.wikipedia.org/wiki/Proline"
				},
				{
					"href": "wiki/alone-phenylalanine.html",
					"title": "Phenylalanine",
					"wiki": "https://en.wikipedia.org/wiki/Phenylalanine"
				},
				{
					"href": "wiki/alone-serine.html",
					"title": "Serine",
					"wiki": "https://en.wikipedia.org/wiki/Serine"
				},
				{
					"href": "wiki/alone-valine.html",
					"title": "Valine",
					"wiki": "https://en.wikipedia.org/wiki/Valine"
				},
				{
					"href": "wiki/alone-nmn.html",
					"title": "NMN",
					"wiki": "https://en.wikipedia.org/wiki/NMN"
				},
				{
					"href": "wiki/alone-leucine.html",
					"title": "Leucine",
					"wiki": "https://en.wikipedia.org/wiki/Leucine"
				},
				{
					"href": "wiki/alone-threonine.html",
					"title": "Threonine",
					"wiki": "https://en.wikipedia.org/wiki/Threonine"
				},
				{
					"href": "wiki/alone-cystine.html",
					"title": "Cystine",
					"wiki": "https://en.wikipedia.org/wiki/Cystine"
				},
				{
					"href": "wiki/alone-amantadine.html",
					"title": "Amantadine",
					"wiki": "https://en.wikipedia.org/wiki/Amantadine"
				},
				{
					"href": "wiki/alone-glycine.html",
					"title": "Glycine",
					"wiki": "https://en.wikipedia.org/wiki/Glycine"
				},
				{
					"href": "wiki/alone-histidine.html",
					"title": "Histidine",
					"wiki": "https://en.wikipedia.org/wiki/Histidine"
				},
				{
					"href": "wiki/alone-glutamic-acid.html",
					"title": "Glutamic acid",
					"wiki": "https://en.wikipedia.org/wiki/Glutamic_acid"
				},
				{
					"href": "wiki/alone-oxiracetam.html",
					"title": "Oxiracetam",
					"wiki": "https://en.wikipedia.org/wiki/Oxiracetam"
				},
				{
					"href": "wiki/alone-1p-lsd.html",
					"title": "1P-LSD",
					"wiki": "https://en.wikipedia.org/wiki/1P-LSD"
				},
				{
					"href": "wiki/alone-o-dsmt.html",
					"title": "O-DSMT",
					"wiki": "https://en.wikipedia.org/wiki/O-DSMT"
				},
				{
					"href": "wiki/alone-galantamine.html",
					"title": "Galantamine",
					"wiki": "https://en.wikipedia.org/wiki/Galantamine"
				},
				{
					"href": "wiki/alone-eutropoflavin.html",
					"title": "Eutropoflavin",
					"wiki": "https://en.wikipedia.org/wiki/Eutropoflavin"
				},
				{
					"href": "wiki/alone-gb-115.html",
					"title": "GB-115"
				},
				{
					"href": "wiki/alone-rapastinel.html",
					"title": "Rapastinel",
					"wiki": "https://en.wikipedia.org/wiki/Rapastinel"
				},
				{
					"href": "wiki/alone-hhc.html",
					"title": "HHC",
					"wiki": "https://en.wikipedia.org/wiki/HHC"
				},
				{
					"href": "wiki/alone-matrine.html",
					"title": "Matrine",
					"wiki": "https://en.wikipedia.org/wiki/Matrine"
				},
				{
					"href": "wiki/alone-creatine.html",
					"title": "Creatine",
					"wiki": "https://en.wikipedia.org/wiki/Creatine"
				},
				{
					"href": "wiki/alone-pramipexole.html",
					"title": "Pramipexole",
					"wiki": "https://en.wikipedia.org/wiki/Pramipexole"
				},
				{
					"href": "wiki/alone-resveratrol.html",
					"title": "Resveratrol",
					"wiki": "https://en.wikipedia.org/wiki/Resveratrol"
				},
				{
					"href": "wiki/alone-resveratrol-trans.html",
					"title": "Resveratrol (trans)"
				},
				{
					"href": "wiki/alone-disulfiram.html",
					"title": "Disulfiram",
					"wiki": "https://en.wikipedia.org/wiki/Disulfiram"
				},
				{
					"href": "wiki/alone-resiquimod.html",
					"title": "Resiquimod",
					"wiki": "https://en.wikipedia.org/wiki/Resiquimod"
				},
				{
					"href": "wiki/alone-meclofenoxate.html",
					"title": "Meclofenoxate",
					"wiki": "https://en.wikipedia.org/wiki/Meclofenoxate"
				},
				{
					"href": "wiki/alone-palmitoylethanolamide.html",
					"title": "Palmitoylethanolamide",
					"wiki": "https://en.wikipedia.org/wiki/Palmitoylethanolamide"
				},
				{
					"href": "wiki/alone-ivermectin.html",
					"title": "Ivermectin",
					"wiki": "https://en.wikipedia.org/wiki/Ivermectin"
				},
				{
					"href": "wiki/alone-agomelatine.html",
					"title": "Agomelatine",
					"wiki": "https://en.wikipedia.org/wiki/Agomelatine"
				},
				{
					"href": "wiki/alone-citicoline.html",
					"title": "Citicoline",
					"wiki": "https://en.wikipedia.org/wiki/Citicoline"
				},
				{
					"href": "wiki/alone-emoxypine.html",
					"title": "Emoxypine",
					"wiki": "https://en.wikipedia.org/wiki/Emoxypine"
				},
				{
					"href": "wiki/alone-oroxylin-a.html",
					"title": "Oroxylin A",
					"wiki": "https://en.wikipedia.org/wiki/Oroxylin_A"
				},
				{
					"href": "wiki/alone-uridine.html",
					"title": "Uridine",
					"wiki": "https://en.wikipedia.org/wiki/Uridine"
				},
				{
					"href": "wiki/alone-tongkat-ali.html",
					"title": "Tongkat Ali",
					"wiki": "https://en.wikipedia.org/wiki/Tongkat_Ali"
				},
				{
					"href": "wiki/alone-lithium-orotate.html",
					"title": "Lithium Orotate",
					"wiki": "https://en.wikipedia.org/wiki/Lithium_orotate"
				},
				{
					"href": "wiki/alone-magnesium-l-threonate.html",
					"title": "Magnesium L-Threonate",
					"wiki": "https://en.wikipedia.org/wiki/Magnesium_L-threonate"
				},
				{
					"href": "wiki/alone-methocarbamol.html",
					"title": "Methocarbamol",
					"wiki": "https://en.wikipedia.org/wiki/Methocarbamol"
				},
				{
					"href": "wiki/alone-imiquimod.html",
					"title": "Imiquimod",
					"wiki": "https://en.wikipedia.org/wiki/Imiquimod"
				},
				{
					"href": "wiki/alone-oxytocin.html",
					"title": "Oxytocin",
					"wiki": "https://en.wikipedia.org/wiki/Oxytocin"
				},
				{
					"href": "wiki/alone-dihydromyricetin.html",
					"title": "Dihydromyricetin",
					"wiki": "https://en.wikipedia.org/wiki/Dihydromyricetin"
				},
				{
					"href": "wiki/alone-dim.html",
					"title": "DIM",
					"wiki": "https://en.wikipedia.org/wiki/DIM"
				},
				{
					"href": "wiki/alone-luteolin.html",
					"title": "Luteolin",
					"wiki": "https://en.wikipedia.org/wiki/Luteolin"
				},
				{
					"href": "wiki/alone-grp55.html",
					"title": "GPR55",
					"wiki": "https://en.wikipedia.org/wiki/GPR55"
				},
				{
					"href": "wiki/alone-valaciclovir.html",
					"title": "Valaciclovir",
					"wiki": "https://en.wikipedia.org/wiki/Valaciclovir"
				},
				{
					"href": "wiki/alone-voriconazole.html",
					"title": "Voriconazole",
					"wiki": "https://en.wikipedia.org/wiki/Voriconazole"
				},
				{
					"href": "wiki/alone-amoxicillin.html",
					"title": "Amoxicillin",
					"wiki": "https://en.wikipedia.org/wiki/Amoxicillin"
				},
				{
					"href": "wiki/alone-trimethoprim-sulfamethoxazole.html",
					"title": "Trimethoprim/Sulfamethoxazole",
					"wiki": "https://en.wikipedia.org/wiki/Trimethoprim/sulfamethoxazole"
				},
				{
					"href": "wiki/alone-flibanserin.html",
					"title": "Flibanserin",
					"wiki": "https://en.wikipedia.org/wiki/Flibanserin"
				},
				{
					"href": "wiki/alone-umifenovir.html",
					"title": "Umifenovir",
					"wiki": "https://en.wikipedia.org/wiki/Umifenovir"
				},
				{
					"href": "wiki/alone-azithromycin.html",
					"title": "Azithromycin",
					"wiki": "https://en.wikipedia.org/wiki/Azithromycin"
				},
				{
					"href": "wiki/alone-itraconazole.html",
					"title": "Itraconazole",
					"wiki": "https://en.wikipedia.org/wiki/Itraconazole"
				},
				{
					"href": "wiki/alone-cefuroxime.html",
					"title": "Cefuroxime",
					"wiki": "https://en.wikipedia.org/wiki/Cefuroxime"
				},
				{
					"href": "wiki/alone-aticaprant.html",
					"title": "Aticaprant",
					"wiki": "https://en.wikipedia.org/wiki/Aticaprant"
				},
				{
					"href": "wiki/alone-lumbrokinase.html",
					"title": "Lumbrokinase",
					"wiki": "https://en.wikipedia.org/wiki/Lumbrokinase"
				},
				{
					"href": "wiki/alone-nattokinase.html",
					"title": "Nattokinase",
					"wiki": "https://en.wikipedia.org/wiki/Nattokinase"
				},
				{
					"href": "wiki/alone-benzylpenicillin.html",
					"title": "Benzylpenicillin",
					"wiki": "https://en.wikipedia.org/wiki/Benzylpenicillin"
				},
				{
					"href": "wiki/alone-tinidazole.html",
					"title": "Tinidazole",
					"wiki": "https://en.wikipedia.org/wiki/Tinidazole"
				}
			],
			"Multiple": [
				{
					"href": "wiki/multiple-vitamin-b-complex.html",
					"title": "Vitamin B Complex",
					"wiki": "https://en.wikipedia.org/wiki/Vitamin_B_Complex"
				},
				{
					"href": "wiki/multiple-inositol-choline.html",
					"title": "Inositol + Choline"
				},
				{
					"href": "wiki/multiple-hemp-rhodiola.html",
					"title": "Hemp + Rhodiola rosea"
				},
				{
					"href": "wiki/multiple-inosine-dmae.html",
					"title": "Inosine + DMAE"
				},
				{
					"href": "wiki/multiple-green-tea-guarana.html",
					"title": "Green Tea + Guarana"
				},
				{
					"href": "wiki/multiple-prl-8-53-dihexa.html",
					"title": "PRL-8-53 + Dihexa"
				}
			],
			"Products": [
				{
					"href": "wiki/product-monster.html",
					"title": "Mega Monster Energy"
				},
				{
					"href": "wiki/product-powerade.html",
					"title": "Powerade Ice Storm"
				},
				{
					"href": "wiki/product-heroic-sport.html",
					"title": "Heroic Sport Isotonic"
				}
			]
		};

		const renderWiki = () => {
			let totalItems = 0;
			for (const [category, items] of Object.entries(wikiData)) {
				const gridId = `grid-${category.toLowerCase()}`;
				const grid = document.getElementById(gridId);
				if (grid) {
					const fragment = document.createDocumentFragment();
					const sortedItems = [...items].sort((a, b) => a.title.localeCompare(b.title));

					sortedItems.forEach(item => {
						const container = document.createElement('div');
						container.className = 'wiki-item-container';

						const a = document.createElement('a');
						a.href = item.href;
						a.className = 'wiki-link';
						a.textContent = item.title;
						container.appendChild(a);

						if (item.wiki) {
							const wLink = document.createElement('a');
							wLink.href = item.wiki;
							wLink.target = '_blank';
							wLink.className = 'wikipedia-icon';
							wLink.innerHTML = 'W';
							wLink.title = 'Read on Wikipedia';
							container.appendChild(wLink);
						}

						fragment.appendChild(container);
						totalItems++;
					});

					grid.innerHTML = '';
					grid.appendChild(fragment);
				}
			}


			const totalCounter = document.getElementById('total-items-count');
			if (totalCounter) {
				totalCounter.textContent = `(${totalItems} items)`;
			}
		};

		let searchIndex = [];

		if (mdFile) {
			try {
				const res = await fetch(`wiki/markdown/${mdFile}.md`);
				if (res.ok) {
					const markdown = await res.text();
					const contentArea = document.querySelector('.category-group').parentElement;
					contentArea.innerHTML = `
				<style>
					.markdown-content { line-height: 1.8; color: var(--text-primary); }
					.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4 {
						font-family: var(--font-mono); margin-top: 2.5rem; margin-bottom: 1.2rem; color: var(--accent);
						border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem;
					}
					.markdown-content ul, .markdown-content ol { margin-left: 1.8rem; margin-bottom: 1.5rem; }
					.markdown-content li { margin-bottom: 0.8rem; }
					.markdown-content p { margin-bottom: 1.3rem; }
					.markdown-content strong { color: var(--accent); }
				</style>
				<div class="search-container">
					<input type="text" id="wiki-search-inline" placeholder="Search wiki items..." autocomplete="off">
					<div id="search-results-inline" class="search-results"></div>
				</div>
				<nav style="margin-bottom: 2rem;">
					<a href="actions.html" style="color: var(--accent); font-family: var(--font-mono); font-size: 0.9rem;">
						← BACK TO CATEGORIES
					</a>
				</nav>
				<div class="markdown-content">
					${marked.parse(markdown)}
				</div>
			`;

					// Set page title
					const displayTitle = mdFile.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
					document.title = `${displayTitle} - Personal Wiki`;

					// Re-bind search for the new input
					const inlineSearch = document.getElementById('wiki-search-inline');
					if (inlineSearch) inlineSearch.addEventListener('input', debounce(handleSearch, 250));

				}
			} catch (e) {
				console.error('Failed to load markdown substance:', e);
			}
		} else {
			renderWiki();
		}

		try {
			const response = await fetch('search-index.json');
			searchIndex = await response.json();

			if (!mdFile) {
				const aloneGrid = document.getElementById('grid-alone');
				if (aloneGrid) {
					const mdItems = searchIndex.filter(item => item.url.startsWith('actions.html?md='));
					mdItems.forEach(item => {
						if (!document.querySelector(`a[href="${item.url}"]`)) {
							wikiData.Alone.push({
								href: item.url,
								title: item.title.replace('Pharmacological Actions of ', ''),
								wiki: item.wiki
							});
						}
					});
					renderWiki();
				}

			}
		} catch (e) {
			console.error('Failed to load search index:', e);
		}

		function handleSearch(e) {
			const query = e.target.value.toLowerCase().trim();
			const resultsContainer = e.target.id === 'wiki-search' ? searchResults : document.getElementById('search-results-inline');

			resultsContainer.innerHTML = '';

			if (query.length < 2) {
				resultsContainer.style.display = 'none';
				return;
			}

			const filtered = searchIndex.filter(item =>
				item.title.toLowerCase().includes(query) ||
				item.content.toLowerCase().includes(query)
			);

			if (filtered.length > 0) {
				filtered.forEach(item => {
					const div = document.createElement('div');
					div.className = 'search-result-item';

					const highlightedTitle = highlight(item.title, query);
					const snippet = getSnippet(item.content, query);

					div.innerHTML = `
					<a href="${item.url}">
						<div class="search-result-header">
							<strong>${highlightedTitle}</strong>
						</div>
						<div class="search-result-snippet">${snippet}</div>
					</a>
				`;
					resultsContainer.appendChild(div);
				});
				resultsContainer.style.display = 'block';
			} else {
				resultsContainer.innerHTML = '<div class="search-no-results">No matches found</div>';
				resultsContainer.style.display = 'block';
			}
		};

		function debounce(func, wait) {
			let timeout;
			return function executedFunction(...args) {
				const later = () => {
					clearTimeout(timeout);
					func(...args);
				};
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
			};
		};

		if (searchInput) searchInput.addEventListener('input', debounce(handleSearch, 250));

		function highlight(text, query) {
			const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
			return text.replace(regex, '<mark>$1</mark>');
		}

		function getSnippet(content, query) {
			const index = content.toLowerCase().indexOf(query);
			const start = Math.max(0, index - 40);
			const end = Math.min(content.length, index + query.length + 60);
			let snippet = content.substring(start, end);
			if (start > 0) snippet = '...' + snippet;
			if (end < content.length) snippet = snippet + '...';
			return highlight(snippet, query);
		}

		const clickHandler = (e) => {
			if (searchInput && !searchInput.contains(e.target) && searchResults && !searchResults.contains(e.target)) {
				searchResults.style.display = 'none';
			}
			const inlineSearch = document.getElementById('wiki-search-inline');
			const inlineResults = document.getElementById('search-results-inline');
			if (inlineSearch && !inlineSearch.contains(e.target) && inlineResults && !inlineResults.contains(e.target)) {
				inlineResults.style.display = 'none';
			}
		};

		if (window.actionsPageClickHandler) {
			document.removeEventListener('click', window.actionsPageClickHandler);
		}
		window.actionsPageClickHandler = clickHandler;
		document.addEventListener('click', clickHandler);
	}

	if (document.readyState === 'complete' || document.readyState === 'interactive') {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}
})();
