async function getCurrency() {
  const el = document.getElementById("currency");

  try {
    el.innerText = "Loading currency...";

    const res = await fetch("https://open.er-api.com/v6/latest/EUR");
    const data = await res.json();

    el.innerHTML = `
      <h5>1 € i olika valutor</h5>
      <ul>
        <li>SEK: ${data.rates.SEK}</li>
        <li>USD: ${data.rates.USD}</li>
        <li>GBP: ${data.rates.GBP}</li>
      </ul>
    `;
  } catch {
    el.innerHTML = "Could not load currency";
  }
}