document.getElementById('patientForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const patientData = {
    diseaseSetting: form.diseaseSetting.value,
    priorChemo: form.priorChemo.value,
    priorLines: form.priorLines.value,
    histology: form.histology.value,
    grade: form.grade.value,
    mmr: form.mmr.value,
    her2: form.her2.value,
    priorIO: form.priorIO.value,
    fra: form.fra.value,
    cldn6: form.cldn6.value,
    meso: form.meso.value,
    topo: form.topo.value,
    measurable: form.measurable.value,
    rasraf: form.rasraf ? form.rasraf.value : "unknown"
  };

  const response = await fetch('trials/endometrial_trials.json');
  const trials = await response.json();

  const eligible = [];
  const potential = [];
  const ineligible = [];

  trials.forEach(trial => {
    const { name, criteria } = trial;
    let isEligible = true;
    let needsBiomarker = false;

    if (criteria.allowedDiseaseSettings && !criteria.allowedDiseaseSettings.includes(patientData.diseaseSetting)) {
      isEligible = false;
    }

    if (criteria.requiresPriorChemo && patientData.priorChemo !== 'yes') isEligible = false;

    if (criteria.requiresPriorIO && patientData.priorIO !== 'yes') isEligible = false;

    if (criteria.excludesPriorTopo && patientData.topo === 'yes') isEligible = false;

    if (criteria.maxPriorLines && patientData.priorLines !== 'unlimited') {
      if (parseInt(patientData.priorLines) > parseInt(criteria.maxPriorLines)) isEligible = false;
    }

    if (criteria.allowedHER2 && !criteria.allowedHER2.includes(patientData.her2)) isEligible = false;

    if (criteria.allowedMMR && !criteria.allowedMMR.includes(patientData.mmr)) isEligible = false;

    if (criteria.requiresMeasurableDisease && patientData.measurable !== 'yes') isEligible = false;

    if (criteria.requiresFRa && patientData.fra !== 'positive') needsBiomarker = true;
    if (criteria.requiresCLDN6 && patientData.cldn6 !== 'positive') needsBiomarker = true;
    if (criteria.requiresMesothelin && patientData.meso !== 'positive') needsBiomarker = true;
    if (criteria.requiresRASRAFMutation && patientData.rasraf !== 'positive') needsBiomarker = true;

    if (isEligible) {
      if (needsBiomarker) potential.push(name);
      else eligible.push(name);
    } else {
      ineligible.push(name);
    }
  });

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <h2>Results:</h2>
    <h3>Eligible Trials</h3>
    <ul>${eligible.map(t => `<li>${t}</li>`).join('') || '<li>None</li>'}</ul>
    <h3>Potentially Eligible (pending biomarkers)</h3>
    <ul>${potential.map(t => `<li>${t}</li>`).join('') || '<li>None</li>'}</ul>
    <h3>Ineligible Trials</h3>
    <ul>${ineligible.map(t => `<li>${t}</li>`).join('') || '<li>None</li>'}</ul>
  `;
});
