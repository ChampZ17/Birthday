document.querySelectorAll(".facts").forEach(fact => {
    fetch('https://birthdaydate.udruzenjetoprak.workers.dev/2/1')
    .then(response => response.text())
    .then(data => {

        singleFact = JSON.parse(data);
        fact.querySelector('p').textContent = `${singleFact.fact}`;

    });
});

