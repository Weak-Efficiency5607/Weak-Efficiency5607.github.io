Here’s a **predicted binding affinities table for Norflurazepam (N-Desalkylflurazepam)** at the **GABA(_A) benzodiazepine site** using QSAR-derived values from the literature (expressed as *log 1/c*, where higher values generally imply **higher predicted affinity**) and contextual docking evidence. Note that these predictions are **computational estimates** from QSAR models developed for benzodiazepines and **are not direct experimental Ki/Kd values**. They provide a rough scale of affinity relative to other benzodiazepines. ([EUDA][1])

### 🧠 Predicted Binding Affinities (QSAR / Docking)

| **Compound (Ligand)**                         | **Predicted Binding (log 1/c)** | **Affinity Interpretation** | **Comments / Source**                                                                                         |
| --------------------------------------------- | ------------------------------: | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Norflurazepam** (N-Desalkylflurazepam)      |                        **8.44** | High predicted affinity     | QSAR prediction from designer benzodiazepine analysis (higher values → greater predicted binding) ([EUDA][1]) |
| *Flunitrazolam* (reference high-potency DBZD) |                            8.88 | Very high                   | QSAR predicted binding for comparison ([EUDA][1])                                                             |
| *Clonazolam* (reference)                      |                            8.86 | Very high                   | QSAR predicted for comparison ([EUDA][1])                                                                     |
| *Fonazepam* (desmethyl-flunitrazepam)         |                            8.46 | High                        | QSAR predicted (active metabolite) ([EUDA][1])                                                                |
| *Nitrazolam*                                  |                            8.34 | Moderate/High               | QSAR prediction for comparison ([EUDA][1])                                                                    |
| *Phenazepam*                                  |                            8.12 | Moderate/High               | Predicted binding value ([EUDA][1])                                                                           |
| *Flutazolam*                                  |                            6.83 | Lower                       | Outlier predicted lower binding from QSAR data ([EUDA][1])                                                    |

---

### 🧪 How to Interpret These Predictions

* **Predicted log 1/c values** (as used in benzodiazepine QSAR studies) correlate with **binding potency**: higher values generally signal stronger predicted receptor binding affinity. ([PMC][2])
* Norflurazepam’s predicted **8.44** value places it in the **high-affinity range** among designer benzodiazepines, similar to other long-acting active metabolites like *fonazepam*. ([EUDA][1])
* These QSAR models were trained on known benzodiazepine binding data and then applied to new designer benzodiazepines, providing relative rather than absolute affinity predictions. ([PubMed][3])

---

### 🧾 Notes & Limitations

1. 🔹 **QSAR vs. experimental Ki** — QSAR *log 1/c* values are statistical predictions, not direct measurements like Ki (nM). Absolute affinity would require experimental displacement assays or high-accuracy docking with validated receptor models. ([PubMed][4])
2. 🔹 **Docking and QSAR models** often show good correlation with experimental data *within a chemical class*, but they do not specify **subtype selectivity** (e.g., α1 vs. α2 GABA(_A) subunits) or **functional effect** (PAM vs. partial agonist). ([PubMed][5])
3. 🔹 The predicted values above reflect **relative binding trends** among classical and designer benzodiazepines and should be used as qualitative guidance rather than definitive pharmacological constants. ([PMC][2])

---

If you want, I can convert these **QRAR log 1/c** predictions into estimated **approximate Ki ranges (nM)** using common QSAR standard curves or provide a modeled **docking score table (e.g., AutoDock Vina)** for Norflurazepam and comparators. Just let me know what format you prefer!

[1]: https://www.euda.europa.eu/system/files/publications/13759/TD0221596ENN_002.pdf?utm_source=chatgpt.com "[PDF] New benzodiazepines in Europe – a review - euda.europa.eu"
[2]: https://pmc.ncbi.nlm.nih.gov/articles/PMC8398354/?utm_source=chatgpt.com "The Psychonauts’ Benzodiazepines; Quantitative Structure-Activity Relationship (QSAR) Analysis and Docking Prediction of Their Biological Activity - PMC"
[3]: https://pubmed.ncbi.nlm.nih.gov/34451817/?utm_source=chatgpt.com "The Psychonauts' Benzodiazepines; Quantitative Structure-Activity Relationship (QSAR) Analysis and Docking Prediction of Their Biological Activity - PubMed"
[4]: https://pubmed.ncbi.nlm.nih.gov/29685303/?utm_source=chatgpt.com "The use of a quantitative structure-activity relationship (QSAR) model to predict GABA-A receptor binding of newly emerging benzodiazepines - PubMed"
[5]: https://pubmed.ncbi.nlm.nih.gov/23279907/?utm_source=chatgpt.com "Pharmacophore, 3D-QSAR, and Bayesian model analysis for ligands binding at the benzodiazepine site of GABAA receptors: the key roles of amino group and hydrophobic sites - PubMed"
